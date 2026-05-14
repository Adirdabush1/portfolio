const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");

dotenv.config();

const { CHAT_SYSTEM_PROMPT } = require("./agents/resume");
const pipeline = require("./agents/pipeline");
const telegram = require("./agents/telegram");
const db = require("./agents/db");

const app = express();

const allowedOrigins = (origin, callback) => {
  // Allow requests from Render, localhost, and no origin (server-to-server)
  if (!origin || origin.includes("onrender.com") || origin.includes("localhost")) {
    callback(null, true);
  } else {
    callback(new Error("Not allowed by CORS"));
  }
};
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "10kb" }));

// Rate limiters
const aiLimiter = rateLimit({ windowMs: 60000, max: 10, message: { error: "Too many requests" } });
const ttsLimiter = rateLimit({ windowMs: 60000, max: 10, message: { error: "Too many requests" } });
const contactLimiter = rateLimit({ windowMs: 60000, max: 3, message: { error: "Too many requests" } });

// Health check for warm-up pings
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Endpoint ל-AI chat
app.post("/api/ask", aiLimiter, async (req, res) => {
  const { question } = req.body;
  if (!question || typeof question !== "string" || question.length > 500) {
    return res.status(400).json({ error: "Invalid question" });
  }

  try {
    const groqRes = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          { role: "system", content: CHAT_SYSTEM_PROMPT },
          { role: "user", content: question },
        ],
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const gptText =
      groqRes.data.choices[0].message?.content || groqRes.data.choices[0].text;

    res.json({ text: gptText });
  } catch (err) {
    console.error("ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "AI failed to respond" });
  }
});

// Endpoint ל-TTS עם ElevenLabs
app.post("/api/tts", ttsLimiter, async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== "string" || text.length > 1000) {
    return res.status(400).json({ error: "Invalid text" });
  }

  try {
    const ttsRes = await axios.post(
      "https://api.elevenlabs.io/v1/text-to-speech/iP95p4xoKVk53GoZ742B",
      {
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        responseType: "arraybuffer",
      }
    );

    res.set({ "Content-Type": "audio/mpeg", "Content-Length": ttsRes.data.length });
    res.send(Buffer.from(ttsRes.data));
  } catch (err) {
    const detail = err.response?.data ? Buffer.from(err.response.data).toString() : err.message;
    console.error("TTS Error:", err.response?.status, detail);
    res.status(500).json({ error: "TTS failed" });
  }
});

// הגדרת nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // המייל שלך מתוך .env
    pass: process.env.EMAIL_PASS, // סיסמת אפליקציה או סיסמה רגילה
  },
});

// Endpoint לשליחת טופס יצירת קשר
app.post("/api/contact", contactLimiter, async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER,
      subject: `New contact form submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// ====================================================================
// Job Application Agent endpoints
// ====================================================================

const agentRunLimiter = rateLimit({ windowMs: 60000, max: 5, message: { error: "Too many requests" } });

// Cron entry point. Returns 202 immediately and runs the pipeline async,
// so cron-job.org never hits the Render 30s HTTP timeout.
app.post("/api/agent/run", agentRunLimiter, async (req, res) => {
  const token = req.get("X-Cron-Token");
  if (!process.env.AGENT_CRON_TOKEN || token !== process.env.AGENT_CRON_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.status(202).json({ status: "accepted" });
  setImmediate(() => {
    pipeline.run().catch((err) => console.error("Pipeline crashed:", err));
  });
});

// Telegram webhook — single endpoint for callback_query, replies, and /add.
app.post("/api/agent/telegram-webhook", async (req, res) => {
  const token = req.get("X-Telegram-Bot-Api-Secret-Token");
  if (process.env.TELEGRAM_WEBHOOK_SECRET && token !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.status(200).json({ ok: true });
  try {
    await telegram.handleUpdate(req.body);
  } catch (err) {
    console.error("Telegram handler error:", err.message);
  }
});

// Re-applies the level filter to pending_approval jobs. Senior+ titles get
// moved to rejected. Used to retroactively clean up after threshold changes.
app.post("/api/agent/recheck-levels", async (req, res) => {
  const token = req.get("X-Cron-Token");
  if (!process.env.AGENT_CRON_TOKEN || token !== process.env.AGENT_CRON_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const levelFilter = require("./agents/levelFilter");
    const { rows: jobs } = await db.query(
      "SELECT id, title, description FROM jobs WHERE status='pending_approval'"
    );
    let rejected = 0, kept = 0;
    const rejectedSamples = [];
    for (const j of jobs) {
      const verdict = levelFilter.classify({ title: j.title, description: j.description });
      if (verdict.startsWith("pass")) {
        kept += 1;
      } else {
        rejected += 1;
        rejectedSamples.push({ id: j.id, title: (j.title || "").slice(0, 80), verdict });
        await db.query(
          "UPDATE jobs SET status='rejected', rejection_reason = COALESCE(rejection_reason, '') || ' ; level-recheck:' || $2 WHERE id=$1",
          [j.id, verdict]
        );
      }
    }
    res.json({ total: jobs.length, kept, rejected, rejectedSamples });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resends all pending_approval jobs to Telegram. Used to recover from
// past delivery failures or rendering issues. Token-guarded.
app.post("/api/agent/resend-pending", async (req, res) => {
  const token = req.get("X-Cron-Token");
  if (!process.env.AGENT_CRON_TOKEN || token !== process.env.AGENT_CRON_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const { rows: jobs } = await db.query(
      "SELECT *, overlap_points AS overlaps FROM jobs WHERE status='pending_approval' ORDER BY relevance_score DESC NULLS LAST LIMIT 20"
    );
    let sent = 0, failed = 0;
    for (const j of jobs) {
      try {
        await telegram.sendJobApproval(j);
        sent += 1;
      } catch (err) {
        console.error(`Resend job #${j.id} failed:`, err.message);
        failed += 1;
      }
    }
    res.json({ totalPending: jobs.length, sent, failed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Diagnostic: groups recent jobs by rejection reason so we can see why
// QA/DevOps/AI titles are being filtered out. Token-guarded.
app.get("/api/agent/rejection-breakdown", async (req, res) => {
  const token = req.get("X-Cron-Token");
  if (!process.env.AGENT_CRON_TOKEN || token !== process.env.AGENT_CRON_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const { rows: byReason } = await db.query(`
      SELECT
        CASE
          WHEN rejection_reason LIKE 'location:%' THEN 'location'
          WHEN rejection_reason LIKE 'level:%'    THEN 'level (senior+)'
          WHEN rejection_reason = 'empty-description' THEN 'empty-description'
          WHEN rejection_reason ILIKE '%senior%' OR rejection_reason ILIKE '%lead%' THEN 'AI: senior/lead'
          WHEN rejection_reason ILIKE '%stack%' OR rejection_reason ILIKE '%overlap%' THEN 'AI: stack mismatch'
          WHEN rejection_reason ILIKE '%experience%' OR rejection_reason ILIKE '%years%' THEN 'AI: experience gap'
          WHEN rejection_reason ILIKE '%manager%' OR rejection_reason ILIKE '%marketing%' OR rejection_reason ILIKE '%sales%' THEN 'AI: non-eng role'
          ELSE 'AI: other'
        END AS bucket,
        COUNT(*)::int AS c
      FROM jobs
      WHERE status='rejected' AND scraped_at > NOW() - INTERVAL '24 hours'
      GROUP BY bucket
      ORDER BY c DESC
    `);
    const { rows: byKeyword } = await db.query(`
      SELECT raw->>'search_keyword' AS keyword, COUNT(*)::int AS c
      FROM jobs
      WHERE source='linkedin' AND raw ? 'search_keyword'
        AND scraped_at > NOW() - INTERVAL '24 hours'
      GROUP BY raw->>'search_keyword'
      ORDER BY c DESC
    `);
    const { rows: recentRejects } = await db.query(`
      SELECT id, source, LEFT(title, 70) AS title, LEFT(rejection_reason, 120) AS rejection_reason, relevance_score
      FROM jobs
      WHERE status='rejected' AND scraped_at > NOW() - INTERVAL '24 hours'
        AND (title ILIKE '%qa%' OR title ILIKE '%devops%' OR title ILIKE '%sre%'
             OR title ILIKE '%ai%' OR title ILIKE '%ml%' OR title ILIKE '%machine learning%'
             OR title ILIKE '%it%')
      ORDER BY scraped_at DESC LIMIT 20
    `);
    res.json({ byReason, byKeyword, recentRejectsQAITAI: recentRejects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Diagnostic: returns latest pipeline run + pending counts. Token-guarded.
app.get("/api/agent/status", async (req, res) => {
  const token = req.get("X-Cron-Token");
  if (!process.env.AGENT_CRON_TOKEN || token !== process.env.AGENT_CRON_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const { rows: runs } = await db.query(
      "SELECT id, status, started_at, finished_at, jobs_fetched, jobs_new, jobs_relevant, LEFT(error, 200) AS error FROM pipeline_runs ORDER BY id DESC LIMIT 5"
    );
    const { rows: statusCounts } = await db.query(
      "SELECT status, COUNT(*)::int AS c FROM jobs GROUP BY status"
    );
    const { rows: pending } = await db.query(
      "SELECT id, source, relevance_score, LEFT(title, 80) AS title FROM jobs WHERE status='pending_approval' ORDER BY relevance_score DESC NULLS LAST LIMIT 15"
    );
    const { rows: sentToday } = await db.query(
      "SELECT COUNT(*)::int AS c FROM applications WHERE status='sent' AND sent_at::date = CURRENT_DATE"
    );
    res.json({ runs, statusCounts, pending, sentToday: sentToday[0].c });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manual job submission — used by frontend or curl. Telegram /add covers the bot path.
const submitLimiter = rateLimit({ windowMs: 60000, max: 20, message: { error: "Too many requests" } });
app.post("/api/agent/submit-job", submitLimiter, async (req, res) => {
  const { url } = req.body || {};
  if (!url || typeof url !== "string" || !/^https?:\/\//i.test(url) || url.length > 1000) {
    return res.status(400).json({ error: "Invalid url" });
  }
  try {
    await db.enqueueManual(url);
    res.json({ status: "queued" });
  } catch (err) {
    console.error("submit-job failed:", err.message);
    res.status(500).json({ error: "Queue failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
