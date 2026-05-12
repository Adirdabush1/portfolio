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
