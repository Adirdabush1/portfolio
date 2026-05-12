// Re-scores jobs that were previously rejected by the location filter but
// got revived (status='new'). Mirrors the pipeline scoring flow without
// rescraping.
require("dotenv").config();
const db = require("../agents/db");
const relevance = require("../agents/relevance");
const composer = require("../agents/composer");
const sender = require("../agents/sender");
const telegram = require("../agents/telegram");
const { extract: extractEmail } = require("../agents/extractEmail");
const { sleep } = require("../agents/groqClient");

const threshold = () => Number(process.env.RELEVANCE_THRESHOLD || 70);
const autoApproveThreshold = () => Number(process.env.AUTO_APPROVE_THRESHOLD || 0);
const groqDelayMs = () => Number(process.env.GROQ_CALL_DELAY_MS || 2500);

(async () => {
  const { rows: jobs } = await db.query(
    "SELECT * FROM jobs WHERE status='new' ORDER BY id ASC LIMIT 50"
  );
  console.log(`Re-scoring ${jobs.length} jobs in status=new`);

  for (const job of jobs) {
    try {
      if (!job.description || job.description.length < 100) {
        await db.updateJobRelevance(job.id, {
          score: 0, reason: "", rejection_reason: "empty-description",
          overlaps: [], ai_metadata: null, status: "rejected",
        });
        continue;
      }

      const result = await relevance.score({
        title: job.title, company: job.company,
        location: job.location, description: job.description,
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

      console.log(`  #${job.id} [${result.score}] ${passed ? "PASS" : "skip"} | ${(job.title||"").slice(0, 60)}`);

      if (passed) {
        const contactEmail = job.contact_email || extractEmail(job.description);
        if (contactEmail && !job.contact_email) {
          await db.setJobContactEmail(job.id, contactEmail);
        }
        const enriched = {
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
          const composed = await composer.compose({ job: enriched, overlaps: result.overlaps });
          if (!composed.error) {
            const sendResult = await sender.send({
              job: enriched, sentTo: contactEmail,
              subject: composed.subject, body: composed.body,
            });
            if (sendResult.sent) {
              await telegram.sendPlain(`🤖 אוטומטי [${result.score}]: נשלח ל-${contactEmail}\n${enriched.title} @ ${enriched.company}\n${enriched.url}`);
              await sleep(groqDelayMs());
              continue;
            }
          }
        }
        await telegram.sendJobApproval(enriched);
      }
      await sleep(groqDelayMs());
    } catch (err) {
      console.error(`  #${job.id} error:`, err.message);
    }
  }
  await db.pool.end();
})().catch((err) => { console.error("FATAL:", err); process.exit(1); });
