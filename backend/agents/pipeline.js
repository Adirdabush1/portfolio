const db = require("./db");
const rss = require("./scrapers/rss");
const linkedin = require("./scrapers/linkedin");
const manual = require("./scrapers/manual");
const hn = require("./scrapers/hn");
const telegramChannels = require("./scrapers/telegramChannels");
const { extractDescription } = require("./extractText");
const { extract: extractEmail } = require("./extractEmail");
const deepEmailSearch = require("./deepEmailSearch");
const relevance = require("./relevance");
const locationFilter = require("./locationFilter");
const levelFilter = require("./levelFilter");
const composer = require("./composer");
const sender = require("./sender");
const telegram = require("./telegram");
const { sleep } = require("./groqClient");

const groqDelayMs = () => Number(process.env.GROQ_CALL_DELAY_MS || 2500);
const threshold = () => Number(process.env.RELEVANCE_THRESHOLD || 70);
const autoApproveThreshold = () => Number(process.env.AUTO_APPROVE_THRESHOLD || 0);

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
        // Lowered from 100 to 40 chars — Israeli Telegram job channels often
        // post short Hebrew blurbs ("מגייסים מפתח/ת ג'וניור 📍 מרכז + link")
        // that are still scorable when combined with the title.
        if (!hydrated.description || hydrated.description.length < 40) {
          await db.updateJobRelevance(job.id, {
            score: 0, reason: "", rejection_reason: "empty-description",
            overlaps: [], ai_metadata: null, status: "rejected",
          });
          continue;
        }

        // Hard location pre-filter: drop foreign-only / no-signal jobs before
        // paying Groq tokens. Israel + remote are kept. Trusted sources
        // (Telegram Israeli channels, LinkedIn Israel search) bypass keyword
        // matching since they are location-filtered upstream.
        const loc = locationFilter.classify({
          title: hydrated.title,
          location: hydrated.location,
          description: hydrated.description,
          source: hydrated.source,
        });
        if (!loc.startsWith("pass")) {
          await db.updateJobRelevance(job.id, {
            score: 0, reason: "", rejection_reason: `location:${loc}`,
            overlaps: [], ai_metadata: null, status: "rejected",
          });
          continue;
        }

        // Hard level pre-filter: reject senior+ titles before AI scoring.
        // Adir is an early-mid engineer, not a fit for senior/lead/principal.
        const lvl = levelFilter.classify({
          title: hydrated.title,
          description: hydrated.description,
        });
        if (!lvl.startsWith("pass")) {
          await db.updateJobRelevance(job.id, {
            score: 0, reason: "", rejection_reason: `level:${lvl}`,
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
          // Look for a recruiter email: description text first (cheap), then
          // follow the URLs in the post to grab mailto:/inline addresses on
          // the linked careers/Greenhouse/Lever page (one network hop each).
          let contactEmail = job.contact_email || extractEmail(hydrated.description);
          if (!contactEmail) {
            const deep = await deepEmailSearch.find({
              url: hydrated.url,
              description: hydrated.description,
            });
            if (deep.email) contactEmail = deep.email;
          }
          if (contactEmail && !job.contact_email) {
            await db.setJobContactEmail(job.id, contactEmail);
          }

          const enrichedJob = {
            ...job,
            relevance_score: result.score,
            relevance_reason: result.reason,
            overlaps: result.overlaps,
            contact_email: contactEmail,
          };

          const canAutoApprove =
            autoApproveThreshold() > 0
            && result.score >= autoApproveThreshold()
            && contactEmail
            && result.overlaps && result.overlaps.length >= 2;

          if (canAutoApprove) {
            try {
              const composed = await composer.compose({ job: enrichedJob, overlaps: result.overlaps });
              if (!composed.error) {
                const sendResult = await sender.send({
                  job: enrichedJob,
                  sentTo: contactEmail,
                  subject: composed.subject,
                  body: composed.body,
                });
                if (sendResult.sent) {
                  await telegram.sendPlain(
                    `🤖 אוטומטי [${result.score}]: נשלח ל-${contactEmail}\n` +
                    `${enrichedJob.title} @ ${enrichedJob.company}\n` +
                    enrichedJob.url
                  );
                  await sleep(groqDelayMs());
                  continue;
                }
                console.error("Auto-approve send failed:", sendResult.reason);
              }
            } catch (err) {
              console.error("Auto-approve flow error:", err.message);
            }
          }

          try {
            await telegram.sendJobApproval(enrichedJob);
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
