// Sends a sample job approval to Telegram so we can see the formatting + buttons.
// No DB write — just exercises the bot connection.
require("dotenv").config();

// Stub DB save so we don't need a real job row for this smoke test
require.cache[require.resolve("../agents/db")] = {
  exports: {
    saveTelegramMessage: async () => {},
    getJob: async () => null,
    findTelegramMessageByMsgId: async () => null,
    updateTelegramDraft: async () => {},
    setJobStatus: async () => {},
    enqueueManual: async () => {},
    alreadySentToday: async () => false,
    countSentToday: async () => 0,
    insertApplication: async () => ({ id: 1 }),
    pool: { end: () => {} },
  },
};

const telegram = require("../agents/telegram");

const mockJob = {
  id: 9999,
  title: "Full-Stack Engineer (AI/LLM)",
  company: "Cohere Israel",
  location: "Tel Aviv · Hybrid",
  url: "https://example.com/jobs/test-12345",
  relevance_score: 88,
  relevance_reason:
    "React + Node + Claude API + RAG match Adir's stack and current MSapps work.",
  overlaps: [
    "Claude API integration (mentioned in JD vs MSapps experience)",
    "RAG retrieval pipelines (matches AI workflow automation expertise)",
    "Next.js + React + TypeScript (core stack)",
  ],
};

(async () => {
  try {
    const msg = await telegram.sendJobApproval(mockJob);
    console.log("✅ Sent. Telegram message_id:", msg.message_id);
    console.log("Check your Telegram chat — you should see the job card with 3 buttons.");
  } catch (err) {
    console.error("❌ FAILED:", err.message);
    if (err.response?.body) {
      console.error("Telegram API response:", err.response.body);
    }
    process.exit(1);
  }
})();
