// Deep email lookup: when extractEmail doesn't find one in the description,
// follow the URLs in the post (and the job's own URL) one hop, fetch the
// destination HTML, and try again. Many Telegram-channel posts only contain
// a shortened URL; the real recruiter email lives on the linked page.

const axios = require("axios");
const cheerio = require("cheerio");
const { extract: extractFromText } = require("./extractEmail");

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const FETCH_TIMEOUT_MS = 8000;

// We deliberately skip pages that we know never expose recruiter emails
// (LinkedIn requires login, login walls etc).
const URL_SKIP_PATTERNS = [
  /linkedin\.com\/jobs/i,
  /linkedin\.com\/login/i,
  /facebook\.com\/login/i,
  /github\.com\/login/i,
];

const URL_RE = /https?:\/\/[^\s"'<>)]+/g;

const candidateUrls = (job) => {
  const set = new Set();
  if (job.url) set.add(job.url);
  const fromDesc = (job.description || "").match(URL_RE) || [];
  for (const u of fromDesc) set.add(u);
  return [...set].filter((u) => !URL_SKIP_PATTERNS.some((re) => re.test(u))).slice(0, 4);
};

const fetchPage = async (url) => {
  try {
    const { data, headers } = await axios.get(url, {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "en-US,en;q=0.9,he;q=0.8" },
      timeout: FETCH_TIMEOUT_MS,
      maxRedirects: 5,
      responseType: "text",
      validateStatus: (s) => s < 500,
    });
    if (typeof data !== "string") return "";
    const ct = headers["content-type"] || "";
    if (!ct.includes("html") && !ct.includes("text")) return "";
    return data;
  } catch {
    return "";
  }
};

// Strip the HTML to plain text + collect `mailto:` link hrefs separately so
// we can prefer them (explicit contact intent).
const harvestEmails = (html) => {
  if (!html) return [];
  const $ = cheerio.load(html);
  const mailtos = [];
  $('a[href^="mailto:"]').each((_, el) => {
    const href = $(el).attr("href") || "";
    const addr = href.replace(/^mailto:/i, "").split("?")[0].trim();
    if (addr) mailtos.push(addr);
  });
  const text = $("body").text() + " " + html;
  const inline = (text.match(/\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g) || []);
  return [...new Set([...mailtos, ...inline])];
};

// Public entrypoint: returns the first plausible recruiter email or null.
// Order: description text → mailto: hrefs in linked pages → inline emails.
const find = async (job) => {
  const fromDesc = extractFromText(job.description);
  if (fromDesc) return { email: fromDesc, source: "description" };

  for (const url of candidateUrls(job)) {
    const html = await fetchPage(url);
    if (!html) continue;
    const emails = harvestEmails(html);
    for (const addr of emails) {
      const plausible = extractFromText(addr);
      if (plausible) return { email: plausible, source: `page:${url}` };
    }
  }
  return { email: null, source: null };
};

module.exports = { find };
