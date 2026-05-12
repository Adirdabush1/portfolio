const db = require("./db");
const rss = require("./scrapers/rss");
const linkedin = require("./scrapers/linkedin");
const manual = require("./scrapers/manual");
const hn = require("./scrapers/hn");
const telegramChannels = require("./scrapers/telegramChannels");
const { extractDescription } = require("./extractText");
const relevance = require("./relevance");
const locationFilter = require("./locationFilter");
const telegram = require("./telegram");
const { sleep } = require("./groqClient");

const groqDelayMs = () => Number(process.env.GROQ_CALL_DELAY_MS || 2500);
const threshold = () => Number(process.env.RELEVANCE_THRESHOLD || 70);

const fetchFromAllSources = async () => {
  const settled = await Promise.allSettled([
    rss.fetch(),
    linkedin.fetch(),
    manual.fetch(),
    hn.fetch(),
    telegramChannels.fetch(),
  ]);
  const out = [];
  for (const r of settled) {
    if (r.status === "fulfilled") out.push(...r.value);
    else console.error("Scraper failed:", r.reason?.message);
  }
  return out;
};

// Hydrates LinkedIn jobs (which only have title/company from search) with the
// full description from the job page so relevance scoring has real content.
const hydrateDescription = async (job) => {
  if (job.description && job.description.length > 200) return job;
  if (job.source === "linkedin" && job.url) {
    const html = await linkedin.fetchDescription(job.url);
    if (html) job.description = extractDescription(html);
  }
  return job;
};

// Main entry. Called from POST /api/agent/run (which already returned 202).
// Never throws — all failures recorded to pipeline_runs.error.
const run = async () => {
  const runId = await db.startRun();
  const counts = { fetched: 0, fresh: 0, relevant: 0 };

  try {
    const all = await fetchFromAllSources();
    counts.fetched = all.length;

    for (const raw of all) {
      try {
        // Skip if fingerprint already seen (same title+company elsewhere)
        if (raw.fingerprint && await db.jobExistsByFingerprint(raw.fingerprint)) continue;

        const job = await db.insertJob(raw);
        if (!job) continue; // url_hash duplicate
        counts.fresh += 1;

        const hydrated = await hydrateDescription(job);
        if (!hydrated.description || hydrated.description.length < 100) {
          await db.updateJobRelevance(job.id, {
            score: 0, reason: "", rejection_reason: "empty-description",
            overlaps: [], ai_metadata: null, status: "rejected",
          });
          continue;
        }

        // Hard location pre-filter: drop foreign-only / no-signal jobs before
        // paying Groq tokens. Israel + remote are kept.
        const loc = locationFilter.classify({
          title: hydrated.title,
          location: hydrated.location,
          description: hydrated.description,
        });
        if (!loc.startsWith("pass")) {
          await db.updateJobRelevance(job.id, {
            score: 0, reason: "", rejection_reason: `location:${loc}`,
            overlaps: [], ai_metadata: null, status: "rejected",
          });
          continue;
        }

        const result = await relevance.score({
          title: hydrated.title,
          company: hydrated.company,
          location: hydrated.location,
          description: hydrated.description,
        });

        const passed = result.score >= threshold();
        await db.updateJobRelevance(job.id, {
          score: result.score,
          reason: result.reason,
          rejection_reason: result.rejection_reason,
          overlaps: result.overlaps,
          ai_metadata: result.ai_metadata,
          status: passed ? "pending_approval" : "rejected",
        });

        if (passed) {
          counts.relevant += 1;
          try {
            await telegram.sendJobApproval({
              ...job,
              relevance_score: result.score,
              relevance_reason: result.reason,
              overlaps: result.overlaps,
            });
          } catch (err) {
            console.error("Telegram send failed:", err.message);
          }
        }

        await sleep(groqDelayMs());
      } catch (err) {
        console.error("Per-job error:", err.message);
      }
    }

    await db.finishRun(runId, {
      jobs_fetched: counts.fetched,
      jobs_new: counts.fresh,
      jobs_relevant: counts.relevant,
      error: null,
      status: "finished",
    });
  } catch (err) {
    await db.finishRun(runId, {
      jobs_fetched: counts.fetched,
      jobs_new: counts.fresh,
      jobs_relevant: counts.relevant,
      error: err.stack || err.message,
      status: "failed",
    });
  }
};

module.exports = { run };
