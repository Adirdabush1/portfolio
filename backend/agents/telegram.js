const TelegramBot = require("node-telegram-bot-api");
const db = require("./db");
const composer = require("./composer");
const sender = require("./sender");

let bot = null;
const getBot = () => {
  if (bot) return bot;
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN missing");
  }
  bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
  return bot;
};

const chatId = () => process.env.TELEGRAM_CHAT_ID;

const formatJobMessage = (job) => {
  const overlaps = (job.overlaps || []).slice(0, 3).map((o, i) => `${i + 1}. ${o}`).join("\n");
  return [
    `🎯 *${escapeMd(job.title || "(no title)")}*`,
    `🏢 ${escapeMd(job.company || "(no company)")}`,
    `📍 ${escapeMd(job.location || "(no location)")}`,
    `⭐ Relevance: ${job.relevance_score}/100`,
    "",
    `_${escapeMd((job.relevance_reason || "").slice(0, 200))}_`,
    "",
    "Overlaps:",
    escapeMd(overlaps || "(none)"),
    "",
    `🔗 ${escapeMd(job.url)}`,
  ].join("\n");
};

const escapeMd = (s) => String(s || "").replace(/([_*[\]()~`>#+\-=|{}.!])/g, "\\$1");

const sendJobApproval = async (job) => {
  const text = formatJobMessage(job);
  const msg = await getBot().sendMessage(chatId(), text, {
    parse_mode: "MarkdownV2",
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✅ Approve", callback_data: `approve:${job.id}` },
          { text: "⏭ Skip",    callback_data: `skip:${job.id}` },
          { text: "✏️ Edit",   callback_data: `edit:${job.id}` },
        ],
      ],
    },
  });
  await db.saveTelegramMessage({
    job_id: job.id,
    message_id: msg.message_id,
    chat_id: msg.chat.id,
  });
  return msg;
};

const sendPlain = (text) =>
  getBot().sendMessage(chatId(), text, { disable_web_page_preview: true });

// ---- webhook handlers ----

const handleCallbackQuery = async (cb) => {
  const b = getBot();
  const [action, jobIdStr] = (cb.data || "").split(":");
  const jobId = Number(jobIdStr);
  if (!jobId) {
    await b.answerCallbackQuery(cb.id, { text: "Bad payload" });
    return;
  }
  const job = await db.getJob(jobId);
  if (!job) {
    await b.answerCallbackQuery(cb.id, { text: "Job not found" });
    return;
  }

  if (action === "skip") {
    await db.setJobStatus(jobId, "rejected");
    await b.answerCallbackQuery(cb.id, { text: "Skipped" });
    await b.editMessageReplyMarkup({ inline_keyboard: [] }, {
      chat_id: cb.message.chat.id, message_id: cb.message.message_id,
    });
    await b.sendMessage(cb.message.chat.id, `⏭ Skipped: ${job.title} @ ${job.company}`);
    return;
  }

  if (action === "approve" || action === "edit") {
    await b.answerCallbackQuery(cb.id, { text: "Composing email..." });

    const composed = await composer.compose({ job, overlaps: job.overlaps || [] });
    if (composed.error) {
      await b.sendMessage(cb.message.chat.id, `❌ Compose failed: ${composed.error}`);
      return;
    }

    if (action === "edit") {
      const draft = await b.sendMessage(
        cb.message.chat.id,
        `✏️ Draft for *${escapeMd(job.title)}* @ *${escapeMd(job.company)}*\n\n` +
        `*Subject:* ${escapeMd(composed.subject)}\n\n${escapeMd(composed.body)}\n\n` +
        `_Reply to this message with corrections, or click Send below._`,
        {
          parse_mode: "MarkdownV2",
          reply_markup: {
            inline_keyboard: [[
              { text: "📤 Send as-is", callback_data: `send:${job.id}` },
              { text: "⏭ Cancel",      callback_data: `skip:${job.id}` },
            ]],
          },
        }
      );
      await db.updateTelegramDraft(job.id, draft.message_id, JSON.stringify(composed));
      return;
    }

    // approve → send immediately
    const sentTo = job.contact_email;
    if (!sentTo) {
      await b.sendMessage(cb.message.chat.id,
        `⚠️ No contact email on file for this job. Reply with the recruiter's email to send.`);
      await db.updateTelegramDraft(job.id, cb.message.message_id, JSON.stringify(composed));
      return;
    }
    const result = await sender.send({ job, sentTo, subject: composed.subject, body: composed.body });
    if (result.sent) {
      await b.sendMessage(cb.message.chat.id, `✅ Sent to ${sentTo}: ${job.title} @ ${job.company}`);
    } else {
      await b.sendMessage(cb.message.chat.id, `❌ Send failed: ${result.reason}`);
    }
    return;
  }

  if (action === "send") {
    const tg = await db.findTelegramMessageByMsgId(cb.message.message_id);
    if (!tg || !tg.draft_email_body) {
      await b.answerCallbackQuery(cb.id, { text: "Draft expired" });
      return;
    }
    const composed = JSON.parse(tg.draft_email_body);
    if (!job.contact_email) {
      await b.answerCallbackQuery(cb.id, { text: "Need recipient — reply with email" });
      return;
    }
    const result = await sender.send({
      job, sentTo: job.contact_email, subject: composed.subject, body: composed.body,
    });
    await b.answerCallbackQuery(cb.id, { text: result.sent ? "Sent" : `Failed: ${result.reason}` });
    return;
  }

  await b.answerCallbackQuery(cb.id, { text: "Unknown action" });
};

const handleReply = async (msg) => {
  // Message is a reply to a draft. Pull the original draft and re-compose with edits.
  const replyTo = msg.reply_to_message;
  if (!replyTo) return false;

  const tg = await db.findTelegramMessageByMsgId(replyTo.message_id);
  if (!tg || !tg.draft_email_body) return false;

  const job = await db.getJob(tg.job_id);
  if (!job) return false;

  const userEdits = msg.text || "";
  // Quick path: if reply looks like an email address, set contact + send.
  if (/^\S+@\S+\.\S+$/.test(userEdits.trim())) {
    const composed = JSON.parse(tg.draft_email_body);
    const result = await sender.send({
      job, sentTo: userEdits.trim(), subject: composed.subject, body: composed.body,
    });
    await getBot().sendMessage(msg.chat.id,
      result.sent ? `✅ Sent to ${userEdits.trim()}` : `❌ ${result.reason}`);
    return true;
  }

  // Otherwise treat reply as composer-edit instructions.
  const recomposed = await composer.compose({
    job,
    overlaps: [
      ...(job.overlaps || []),
      `User edit instructions: ${userEdits}`,
    ],
  });
  if (recomposed.error) {
    await getBot().sendMessage(msg.chat.id, `❌ Recompose failed: ${recomposed.error}`);
    return true;
  }
  const next = await getBot().sendMessage(
    msg.chat.id,
    `✏️ Revised draft:\n\n*Subject:* ${escapeMd(recomposed.subject)}\n\n${escapeMd(recomposed.body)}`,
    {
      parse_mode: "MarkdownV2",
      reply_markup: {
        inline_keyboard: [[
          { text: "📤 Send as-is", callback_data: `send:${job.id}` },
          { text: "⏭ Cancel",      callback_data: `skip:${job.id}` },
        ]],
      },
    }
  );
  await db.updateTelegramDraft(job.id, next.message_id, JSON.stringify(recomposed));
  return true;
};

// Handles /add <url> command — pushes a URL into manual_queue.
const handleAddCommand = async (msg) => {
  const m = msg.text?.match(/^\/add\s+(https?:\/\/\S+)/i);
  if (!m) return false;
  await db.enqueueManual(m[1]);
  await getBot().sendMessage(msg.chat.id, `📥 Queued: ${m[1]}`);
  return true;
};

const handleUpdate = async (update) => {
  if (update.callback_query) {
    await handleCallbackQuery(update.callback_query);
    return;
  }
  if (update.message) {
    if (await handleAddCommand(update.message)) return;
    if (await handleReply(update.message)) return;
  }
};

module.exports = { sendJobApproval, sendPlain, handleUpdate, escapeMd };
