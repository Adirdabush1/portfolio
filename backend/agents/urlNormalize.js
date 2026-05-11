const crypto = require("crypto");

// Tracking params stripped before hashing. Job URLs commonly carry these.
const TRACKING_PARAMS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "ref", "refId", "refid", "ref_src", "src", "source",
  "tracking", "trackingId", "tk", "trk", "trkInfo",
  "gclid", "fbclid", "msclkid", "_ga", "mc_cid", "mc_eid",
  "campaign", "ad_id", "adgroup", "keyword",
]);

const normalizeUrl = (rawUrl) => {
  let u;
  try {
    u = new URL(rawUrl);
  } catch {
    return rawUrl.trim().toLowerCase();
  }
  for (const key of [...u.searchParams.keys()]) {
    if (TRACKING_PARAMS.has(key)) u.searchParams.delete(key);
  }
  u.hostname = u.hostname.toLowerCase().replace(/^www\./, "");
  u.hash = "";
  if ((u.protocol === "https:" && u.port === "443") ||
      (u.protocol === "http:" && u.port === "80")) u.port = "";
  // Trailing slash off (except root)
  if (u.pathname.length > 1 && u.pathname.endsWith("/")) {
    u.pathname = u.pathname.slice(0, -1);
  }
  return u.toString();
};

const hashUrl = (canonical) =>
  crypto.createHash("sha256").update(canonical).digest("hex");

const fingerprintJob = (title, company) => {
  const t = (title || "").trim().toLowerCase().replace(/\s+/g, " ");
  const c = (company || "").trim().toLowerCase().replace(/\s+/g, " ");
  if (!t || !c) return null;
  return crypto.createHash("sha256").update(`${t}::${c}`).digest("hex");
};

module.exports = { normalizeUrl, hashUrl, fingerprintJob };
