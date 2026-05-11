// Full pipeline smoke test — runs scrapers + relevance + writes to DB.
// Telegram disabled by stubbing the module. No actual emails sent.
require("dotenv").config();

// Stub telegram so the pipeline doesn't try to send messages
require.cache[require.resolve("../agents/telegram")] = {
  exports: {
    sendJobApproval: async (job) => {
      console.log(`  📨 [stubbed] Would send Telegram for: ${job.title} @ ${job.company} (${job.relevance_score})`);
      return { message_id: 0 };
    },
    sendPlain: async (t) => console.log("  📨 [stubbed]", t),
    handleUpdate: async () => {},
    escapeMd: (s) => s,
  },
};

const pipeline = require("../agents/pipeline");
const db = require("../agents/db");

(async () => {
  console.log("Running pipeline...\n");
  const t0 = Date.now();
  await pipeline.run();
  const dt = ((Date.now() - t0) / 1000).toFixed(1);

  console.log(`\n✅ Pipeline finished in ${dt}s`);

  const { rows: runs } = await db.query(
    "SELECT * FROM pipeline_runs ORDER BY id DESC LIMIT 1"
  );
  console.log("\nLast run:", runs[0]);

  const { rows: jobs } = await db.query(
    `SELECT id, source, title, company, relevance_score, status, rejection_reason
       FROM jobs ORDER BY id DESC LIMIT 20`
  );
  console.log(`\nJobs in DB (${jobs.length} shown):`);
  for (const j of jobs) {
    const flag = j.status === "pending_approval" ? "✅" : j.status === "rejected" ? "❌" : "·";
    console.log(`  ${flag} [${j.relevance_score ?? "-"}] ${j.source} | ${j.title} @ ${j.company} | ${j.rejection_reason || ""}`);
  }
  await db.pool.end();
})().catch((err) => {
  console.error("FAILED:", err.stack);
  process.exit(1);
});
