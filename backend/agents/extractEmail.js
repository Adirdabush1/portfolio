// Tries to find a recruiter email in the job description / raw text.
// Used to enable auto-approve when a clear contact exists.
// Falls back to null (which keeps the job in the manual approval flow).

const EMAIL_RE = /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g;

const BLACKLIST_DOMAINS = new Set([
  "example.com", "test.com", "yourdomain.com",
  "sentry.io", "datadoghq.com", "linkedin.com",
]);

const BLACKLIST_PREFIXES = ["noreply", "no-reply", "notifications", "alerts", "support@linkedin"];

const looksLikeRecruiter = (addr) => {
  const lower = addr.toLowerCase();
  if (BLACKLIST_PREFIXES.some((p) => lower.startsWith(p))) return false;
  const domain = lower.split("@")[1] || "";
  if (BLACKLIST_DOMAINS.has(domain)) return false;
  return true;
};

const extract = (text) => {
  if (!text) return null;
  const matches = [...new Set(text.match(EMAIL_RE) || [])];
  for (const m of matches) {
    if (looksLikeRecruiter(m)) return m;
  }
  return null;
};

module.exports = { extract };
