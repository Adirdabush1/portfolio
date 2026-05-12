// Reads recent messages from Israeli job channels via the user's own MTProto
// session. Treats each message as a candidate "job" and lets the AI relevance
// scorer decide which ones to surface.
//
// Requires TELEGRAM_API_ID, TELEGRAM_API_HASH, TELEGRAM_SESSION env vars.
// Run scripts/telegram-login.js once locally to create the session.

const crypto = require("crypto");
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { normalizeUrl, hashUrl, fingerprintJob } = require("../urlNormalize");

// Default channels. Override via TELEGRAM_CHANNELS env (comma-separated handles).
const DEFAULT_CHANNELS = [
  "LogOnSoftware",
  "HiTech_Jobs_In_Israel",
];

const MAX_MESSAGES_PER_CHANNEL = 50;
const MAX_AGE_HOURS = 36;

const channelHandles = () => {
  const raw = process.env.TELEGRAM_CHANNELS;
  if (!raw) return DEFAULT_CHANNELS;
  return raw.split(",").map((s) => s.trim().replace(/^@/, "")).filter(Boolean);
};

const ageHours = (epochSec) => (Date.now() / 1000 - epochSec) / 3600;

// First non-empty line, capped, used as title. Hebrew RTL is fine.
const extractTitle = (text) => {
  const lines = (text || "").split("\n").map((s) => s.trim()).filter(Boolean);
  return (lines[0] || "").slice(0, 200);
};

// First URL embedded in the message body, used as the canonical URL when
// available. Falls back to the t.me link to the message itself.
const extractUrl = (text) => {
  const m = text?.match(/https?:\/\/\S+/);
  return m ? m[0] : null;
};

const msgToJob = (channel, msg) => {
  const text = msg.message || "";
  if (!text.trim()) return null;
  const title = extractTitle(text);
  if (!title || title.length < 8) return null;

  const externalUrl = extractUrl(text);
  const tmeUrl = `https://t.me/${channel}/${msg.id}`;
  const primaryUrl = externalUrl || tmeUrl;
  const canonical = normalizeUrl(primaryUrl);

  // Stable URL hash that includes the t.me message id, so different posts
  // that mention the same external URL stay distinct.
  const url_hash = crypto
    .createHash("sha256")
    .update(`${canonical}::${tmeUrl}`)
    .digest("hex");

  return {
    source: `telegram:${channel}`,
    url: primaryUrl,
    url_canonical: canonical,
    url_hash,
    fingerprint: fingerprintJob(title, channel),
    title,
    company: "",
    location: "",
    description: text.slice(0, 6000),
    raw: {
      channel,
      message_id: msg.id,
      date: msg.date,
      tme_url: tmeUrl,
      external_url: externalUrl,
    },
  };
};

const fetchOneChannel = async (client, handle) => {
  try {
    const messages = await client.getMessages(handle, { limit: MAX_MESSAGES_PER_CHANNEL });
    const fresh = messages.filter((m) => m.message && ageHours(m.date) <= MAX_AGE_HOURS);
    return fresh.map((m) => msgToJob(handle, m)).filter(Boolean);
  } catch (err) {
    console.error(`Telegram channel ${handle} fetch failed:`, err.message);
    return [];
  }
};

const fetch = async () => {
  const { TELEGRAM_API_ID, TELEGRAM_API_HASH, TELEGRAM_SESSION } = process.env;
  if (!TELEGRAM_API_ID || !TELEGRAM_API_HASH || !TELEGRAM_SESSION) {
    return [];
  }

  const client = new TelegramClient(
    new StringSession(TELEGRAM_SESSION),
    parseInt(TELEGRAM_API_ID, 10),
    TELEGRAM_API_HASH,
    { connectionRetries: 3 }
  );

  try {
    await client.connect();
  } catch (err) {
    console.error("Telegram client connect failed:", err.message);
    return [];
  }

  const handles = channelHandles();
  const results = await Promise.allSettled(handles.map((h) => fetchOneChannel(client, h)));
  await client.disconnect().catch(() => {});

  const out = [];
  for (const r of results) {
    if (r.status === "fulfilled") out.push(...r.value);
    else console.error("Channel fetch rejected:", r.reason?.message);
  }
  return out;
};

module.exports = { fetch };
