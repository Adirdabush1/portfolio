// Hacker News sources:
//   1. Monthly "Ask HN: Who is hiring?" thread — top-level comments are jobs
//   2. hnrss.org/jobs — YC startup jobs syndicated to HN frontpage
//
// Algolia API: https://hn.algolia.com/api/v1
// hnrss.org: free, no rate limit advertised

const axios = require("axios");
const Parser = require("rss-parser");
const { normalizeUrl, hashUrl, fingerprintJob } = require("../urlNormalize");

const parser = new Parser({ timeout: 15000 });

const ALGOLIA_BASE = "https://hn.algolia.com/api/v1";
const HNRSS_JOBS = "https://hnrss.org/jobs";

const HTML_ENTITIES = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": "\"",
  "&#x27;": "'", "&#39;": "'", "&#x2F;": "/", "&#47;": "/",
  "&nbsp;": " ",
};
const decodeEntities = (s) => {
  if (!s) return "";
  let out = s;
  for (const [k, v] of Object.entries(HTML_ENTITIES)) out = out.split(k).join(v);
  // Numeric entities
  out = out.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
  out = out.replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(parseInt(num, 10)));
  return out;
};

const STRIP_HTML = /<[^>]+>/g;
const stripHtml = (s) =>
  decodeEntities((s || "").replace(STRIP_HTML, " ")).replace(/\s+/g, " ").trim();

// HN Who's Hiring comments follow loose conventions:
//   "Company | Location | Mode | Role"
//   "Company (YC X22) | Role | Location"
//   "[Company] - Role - Location"
// We extract first segment as company, treat the full first line as title for
// AI context, and dump the whole comment into description.
const parseHiringComment = (raw) => {
  const text = stripHtml(raw);
  const firstLine = text.split(/\n|\.\s/)[0].trim().slice(0, 250);
  const parts = firstLine.split(/\s*\|\s*/);
  const company = (parts[0] || "").replace(/\s*\(YC[^)]*\)/, "").trim();
  return { title: firstLine, company, location: "", description: text };
};

const findLatestHiringThread = async () => {
  // search_by_date sorts newest first. author_whoishiring is the canonical
  // poster of monthly threads, so this returns the most recent monthly post.
  const url = `${ALGOLIA_BASE}/search_by_date?tags=story,author_whoishiring&hitsPerPage=5`;
  try {
    const { data } = await axios.get(url, { timeout: 15000 });
    const hit = (data.hits || []).find((h) => /who\s+is\s+hiring/i.test(h.title || ""));
    return hit?.objectID || null;
  } catch (err) {
    console.error("HN Algolia search failed:", err.message);
    return null;
  }
};

const fetchHiringComments = async (storyId) => {
  try {
    const { data } = await axios.get(`${ALGOLIA_BASE}/items/${storyId}`, { timeout: 20000 });
    return data.children || [];
  } catch (err) {
    console.error("HN Algolia item fetch failed:", err.message);
    return [];
  }
};

const fetchWhoIsHiring = async () => {
  const storyId = await findLatestHiringThread();
  if (!storyId) return [];

  const comments = await fetchHiringComments(storyId);
  const out = [];
  for (const c of comments) {
    if (!c.text) continue;
    const { title, company, location, description } = parseHiringComment(c.text);
    if (!title || title.length < 10) continue;

    const url = `https://news.ycombinator.com/item?id=${c.id}`;
    const canonical = normalizeUrl(url);
    out.push({
      source: "hn:whoishiring",
      url,
      url_canonical: canonical,
      url_hash: hashUrl(canonical),
      fingerprint: fingerprintJob(title, company),
      title,
      company,
      location,
      description: description.slice(0, 6000),
      raw: { hn_comment_id: c.id, story_id: storyId },
    });
  }
  return out;
};

const fetchYcJobs = async () => {
  try {
    const feed = await parser.parseURL(HNRSS_JOBS);
    return (feed.items || []).map((item) => {
      const url = item.link;
      const canonical = normalizeUrl(url);
      // HN job titles look like "Stripe (YC S09) Is Hiring a Foo (City, Remote)"
      const m = item.title?.match(/^(.+?)\s+\(YC\s+[^)]+\)\s+(?:Is\s+)?[Hh]iring(?:\s+(?:a|an)\s+)?(.+?)(?:\s+\(([^)]+)\))?$/);
      let company, title, location;
      if (m) {
        company = m[1].trim();
        title = m[2].trim();
        location = m[3]?.trim() || "";
      } else {
        company = "";
        title = item.title || "";
        location = "";
      }
      return {
        source: "hn:yc-jobs",
        url,
        url_canonical: canonical,
        url_hash: hashUrl(canonical),
        fingerprint: fingerprintJob(title, company),
        title,
        company,
        location,
        description: stripHtml(item.contentSnippet || item.content || ""),
        raw: { isoDate: item.isoDate },
      };
    });
  } catch (err) {
    console.error("HN YC RSS fetch failed:", err.message);
    return [];
  }
};

const fetch = async () => {
  const [hiring, ycJobs] = await Promise.all([fetchWhoIsHiring(), fetchYcJobs()]);
  return [...hiring, ...ycJobs];
};

module.exports = { fetch };
