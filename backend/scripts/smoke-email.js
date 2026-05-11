// Composes + sends ONE personalized application email to YOU (not to recruiter)
// so you can verify formatting, attachment, and Gmail delivery.
require("dotenv").config();
const db = require("../agents/db");
const composer = require("../agents/composer");
const sender = require("../agents/sender");

const TEST_RECIPIENT = process.env.EMAIL_USER; // send to yourself

(async () => {
  // Pick highest-scoring pending_approval job
  const { rows } = await db.query(
    `SELECT *, overlap_points AS overlaps
       FROM jobs
      WHERE status = 'pending_approval'
      ORDER BY relevance_score DESC
      LIMIT 1`
  );
  if (rows.length === 0) {
    console.error("❌ No pending_approval jobs in DB. Run smoke-pipeline first.");
    process.exit(1);
  }
  const job = rows[0];
  console.log(`📋 Using job: [${job.relevance_score}] ${job.title} @ ${job.company}\n`);

  console.log("✏️  Composing email...");
  const composed = await composer.compose({ job, overlaps: job.overlaps || [] });
  if (composed.error) {
    console.error("❌ Compose failed:", composed.error);
    process.exit(1);
  }
  console.log("Subject:", composed.subject);
  console.log("\nBody:\n" + composed.body);

  console.log(`\n📤 Sending to ${TEST_RECIPIENT}...`);
  const result = await sender.send({
    job,
    sentTo: TEST_RECIPIENT,
    subject: composed.subject,
    body: composed.body,
  });

  if (result.sent) {
    console.log(`✅ Sent. Application id: ${result.applicationId}`);
    console.log("Check your Gmail inbox — the CV should be attached.");
  } else {
    console.log(`❌ Not sent: ${result.reason}`, result.error || "");
  }
  await db.pool.end();
})().catch((err) => {
  console.error("FAILED:", err.stack);
  process.exit(1);
});
