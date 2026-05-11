const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const db = require("./db");

// Single transporter instance, lazy-init so missing env vars don't crash on require.
let transporter = null;
const getTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter;
};

// CV lives at repo root, one dir up from /backend.
const CV_PATH = path.resolve(__dirname, "..", "..", "Adir_Dabush_CV.pdf");
const CV_FILENAME = "Adir_Dabush_CV.pdf";

const cvAttachment = () => {
  if (!fs.existsSync(CV_PATH)) {
    throw new Error(`CV not found at ${CV_PATH}`);
  }
  return { filename: CV_FILENAME, path: CV_PATH, contentType: "application/pdf" };
};

const dailyCap = () => Number(process.env.DAILY_EMAIL_CAP || 15);

// Sends one application email. Skips if already sent to this address today or
// daily cap reached. Returns { sent: boolean, reason?: string, applicationId?: number }.
const send = async ({ job, sentTo, subject, body }) => {
  if (!sentTo) return { sent: false, reason: "no-recipient" };

  if (await db.alreadySentToday(sentTo)) {
    return { sent: false, reason: "already-sent-today" };
  }

  const todayCount = await db.countSentToday();
  if (todayCount >= dailyCap()) {
    return { sent: false, reason: "daily-cap-reached" };
  }

  const fromName = process.env.EMAIL_FROM_NAME || "Adir Dabush";
  const fromAddr = process.env.EMAIL_USER;

  try {
    await getTransporter().sendMail({
      from: `"${fromName}" <${fromAddr}>`,
      to: sentTo,
      replyTo: fromAddr,
      subject,
      text: body,
      attachments: [cvAttachment()],
    });
  } catch (err) {
    console.error("sendMail failed:", err.message);
    await db.insertApplication({
      job_id: job.id,
      email_subject: subject,
      email_body: body,
      sent_to: sentTo,
      status: "error",
    });
    await db.setJobStatus(job.id, "failed");
    return { sent: false, reason: "smtp-error", error: err.message };
  }

  const app = await db.insertApplication({
    job_id: job.id,
    email_subject: subject,
    email_body: body,
    sent_to: sentTo,
    status: "sent",
  });
  await db.setJobStatus(job.id, "sent");
  return { sent: true, applicationId: app.id };
};

module.exports = { send, CV_PATH };
