// Standalone smoke test: relevance + composer against mock jobs, no DB.
// Run: cd backend && node scripts/smoke-ai.js
require("dotenv").config();
const relevance = require("../agents/relevance");
const composer = require("../agents/composer");

const TEST_JOBS = [
  {
    label: "✅ Should score HIGH — Full-Stack + Claude/RAG",
    title: "Full-Stack Engineer (AI/LLM)",
    company: "Cohere Israel",
    location: "Tel Aviv, Hybrid",
    description: `We are building AI-first products and need an engineer who can ship.
You'll work with React, Next.js, Node.js, TypeScript on the front and back end.
We integrate Claude API with RAG retrieval pipelines to power our agent product.
2+ years experience preferred. You should know prompt engineering and have
shipped LLM-backed features to production. We value depth over years.`,
  },
  {
    label: "❌ Should score LOW — Senior 7+",
    title: "Principal Backend Engineer",
    company: "Big Bank",
    location: "Tel Aviv, On-site",
    description: `7+ years required. You will lead architecture for our Java/Spring
backend. Experience with Kafka, microservices at scale, mentoring engineers.
This is a senior IC role for a proven leader. Java experience mandatory.`,
  },
  {
    label: "❌ Should score LOW — undervalues Adir",
    title: "Junior Developer — First Position",
    company: "StartupCo",
    location: "Tel Aviv",
    description: `Looking for recent graduates or bootcamp grads for their first
developer role. No experience required, we will train you from scratch. Paid
trainee program. Great opportunity for someone looking to start their journey.`,
  },
];

const main = async () => {
  for (const job of TEST_JOBS) {
    console.log("\n" + "=".repeat(70));
    console.log(job.label);
    console.log(`${job.title} @ ${job.company}`);
    console.log("=".repeat(70));

    const score = await relevance.score(job);
    console.log("Score:", score.score);
    console.log("Reason:", score.reason || "(empty)");
    console.log("Rejection:", score.rejection_reason || "(empty)");
    console.log("Overlaps:", JSON.stringify(score.overlaps, null, 2));

    if (score.score >= 70 && score.overlaps.length >= 2) {
      console.log("\n--- Composer output ---");
      const email = await composer.compose({ job, overlaps: score.overlaps });
      if (email.error) {
        console.log("Compose error:", email.error);
      } else {
        console.log("Subject:", email.subject);
        console.log("\nBody:\n" + email.body);
      }
    }
  }
};

main().catch((err) => {
  console.error("FAILED:", err.message);
  process.exit(1);
});
