const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("supabase") || process.env.DATABASE_URL?.includes("neon")
    ? { rejectUnauthorized: false }
    : false,
  max: 5,
});

pool.on("error", (err) => {
  console.error("Postgres pool error:", err.message);
});

const query = (text, params) => pool.query(text, params);

// ---- jobs ----

const insertJob = async (job) => {
  const { rows } = await query(
    `INSERT INTO jobs (source, url, url_canonical, url_hash, fingerprint, title,
                       company, location, description, raw, contact_email)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT (url_hash) DO NOTHING
     RETURNING *`,
    [job.source, job.url, job.url_canonical, job.url_hash, job.fingerprint,
     job.title, job.company, job.location, job.description, job.raw || null,
     job.contact_email || null]
  );
  return rows[0] || null;
};

const jobExistsByFingerprint = async (fingerprint) => {
  if (!fingerprint) return false;
  const { rows } = await query(
    `SELECT id FROM jobs WHERE fingerprint = $1 LIMIT 1`,
    [fingerprint]
  );
  return rows.length > 0;
};

const updateJobRelevance = async (jobId, { score, reason, rejection_reason, overlaps, ai_metadata, status }) => {
  await query(
    `UPDATE jobs
        SET relevance_score = $2,
            relevance_reason = $3,
            rejection_reason = $4,
            overlap_points = $5,
            ai_metadata = $6,
            status = $7
      WHERE id = $1`,
    [jobId, score, reason || "", rejection_reason || "",
     overlaps ? JSON.stringify(overlaps) : null,
     ai_metadata ? JSON.stringify(ai_metadata) : null,
     status]
  );
};

const setJobStatus = async (jobId, status) =>
  query(`UPDATE jobs SET status = $2 WHERE id = $1`, [jobId, status]);

const setJobContactEmail = async (jobId, email) =>
  query(`UPDATE jobs SET contact_email = $2 WHERE id = $1 AND contact_email IS NULL`,
        [jobId, email]);

const getJob = async (jobId) => {
  const { rows } = await query(
    `SELECT *, overlap_points AS overlaps FROM jobs WHERE id = $1`,
    [jobId]
  );
  return rows[0] || null;
};

// ---- applications ----

const alreadySentToday = async (sentTo) => {
  if (!sentTo) return false;
  const { rows } = await query(
    `SELECT id FROM applications
      WHERE sent_to = $1 AND status = 'sent' AND sent_at::date = CURRENT_DATE
      LIMIT 1`,
    [sentTo]
  );
  return rows.length > 0;
};

const countSentToday = async () => {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS c FROM applications
      WHERE status = 'sent' AND sent_at::date = CURRENT_DATE`
  );
  return rows[0].c;
};

const insertApplication = async (app) => {
  const { rows } = await query(
    `INSERT INTO applications (job_id, email_subject, email_body, sent_to, sent_at, status)
     VALUES ($1,$2,$3,$4,NOW(),$5)
     RETURNING *`,
    [app.job_id, app.email_subject, app.email_body, app.sent_to, app.status]
  );
  return rows[0];
};

// ---- manual queue ----

const enqueueManual = (url) =>
  query(
    `INSERT INTO manual_queue (url) VALUES ($1)`,
    [url]
  );

const drainManual = async () => {
  const { rows } = await query(
    `SELECT * FROM manual_queue WHERE processed = FALSE ORDER BY added_at ASC LIMIT 50`
  );
  return rows;
};

const markManualProcessed = (id) =>
  query(`UPDATE manual_queue SET processed = TRUE WHERE id = $1`, [id]);

// ---- pipeline_runs ----

const startRun = async () => {
  const { rows } = await query(
    `INSERT INTO pipeline_runs (status) VALUES ('running') RETURNING id`
  );
  return rows[0].id;
};

const finishRun = (id, { jobs_fetched, jobs_new, jobs_relevant, error, status }) =>
  query(
    `UPDATE pipeline_runs
        SET finished_at = NOW(),
            jobs_fetched = $2,
            jobs_new = $3,
            jobs_relevant = $4,
            error = $5,
            status = $6
      WHERE id = $1`,
    [id, jobs_fetched || 0, jobs_new || 0, jobs_relevant || 0, error || null, status]
  );

// ---- telegram_messages ----

const saveTelegramMessage = (row) =>
  query(
    `INSERT INTO telegram_messages (job_id, message_id, chat_id, draft_message_id, draft_email_body)
     VALUES ($1,$2,$3,$4,$5)`,
    [row.job_id, row.message_id, row.chat_id, row.draft_message_id || null, row.draft_email_body || null]
  );

const findTelegramMessageByMsgId = async (messageId) => {
  const { rows } = await query(
    `SELECT * FROM telegram_messages WHERE message_id = $1 OR draft_message_id = $1 LIMIT 1`,
    [messageId]
  );
  return rows[0] || null;
};

const updateTelegramDraft = (jobId, draftMessageId, draftBody) =>
  query(
    `UPDATE telegram_messages
        SET draft_message_id = $2, draft_email_body = $3
      WHERE job_id = $1`,
    [jobId, draftMessageId, draftBody]
  );

module.exports = {
  pool,
  query,
  insertJob,
  jobExistsByFingerprint,
  updateJobRelevance,
  setJobStatus,
  setJobContactEmail,
  getJob,
  alreadySentToday,
  countSentToday,
  insertApplication,
  enqueueManual,
  drainManual,
  markManualProcessed,
  startRun,
  finishRun,
  saveTelegramMessage,
  findTelegramMessageByMsgId,
  updateTelegramDraft,
};
