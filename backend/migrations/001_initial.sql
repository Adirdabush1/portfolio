-- Job Application Agent — initial schema
-- Run: psql $DATABASE_URL -f backend/migrations/001_initial.sql

CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  url_canonical TEXT NOT NULL,
  url_hash TEXT UNIQUE NOT NULL,
  fingerprint TEXT,
  title TEXT,
  company TEXT,
  location TEXT,
  description TEXT,
  raw JSONB,
  relevance_score INT,
  relevance_reason TEXT,
  rejection_reason TEXT,
  overlap_points JSONB,
  ai_metadata JSONB,
  status TEXT NOT NULL DEFAULT 'new',
  contact_email TEXT,
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  job_id INT REFERENCES jobs(id) ON DELETE CASCADE,
  email_subject TEXT,
  email_body TEXT,
  sent_to TEXT,
  sent_at TIMESTAMPTZ,
  status TEXT,
  tracking_pixel_id UUID,
  opened_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS manual_queue (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS pipeline_runs (
  id SERIAL PRIMARY KEY,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  jobs_fetched INT DEFAULT 0,
  jobs_new INT DEFAULT 0,
  jobs_relevant INT DEFAULT 0,
  error TEXT,
  status TEXT NOT NULL DEFAULT 'running'
);

CREATE TABLE IF NOT EXISTS telegram_messages (
  id SERIAL PRIMARY KEY,
  job_id INT REFERENCES jobs(id) ON DELETE CASCADE,
  message_id BIGINT NOT NULL,
  chat_id BIGINT NOT NULL,
  draft_message_id BIGINT,
  draft_email_body TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_fingerprint ON jobs(fingerprint);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_url_hash ON jobs(url_hash);
CREATE INDEX IF NOT EXISTS idx_apps_sent_at ON applications(sent_at);
CREATE INDEX IF NOT EXISTS idx_apps_sent_to ON applications(sent_to);
CREATE INDEX IF NOT EXISTS idx_tg_msg_id ON telegram_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_tg_draft_msg_id ON telegram_messages(draft_message_id);
