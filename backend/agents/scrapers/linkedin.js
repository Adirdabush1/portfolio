const axios = require("axios");
const cheerio = require("cheerio");
const { normalizeUrl, hashUrl, fingerprintJob } = require("../urlNormalize");

// Public guest jobs search — no login. ToS allows public browsing.
// We fan out across multiple role keywords so Adir gets coverage beyond
// just Full Stack. Israel geo (id 101620260) + posted-in-last-day filter.
const SEARCH_KEYWORDS = [
  "Full Stack Developer",
  "Backend Developer",
  "Frontend Developer",
  "Software Engineer",
  "QA Automation Engineer",
  "DevOps Engineer",
  "Site Reliability Engineer",
  "AI Engineer",
  "Machine Learning Engineer",
  "AI Integration",
];

const buildSearchUrl = (keyword) =>
  "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?" +
  `keywords=${encodeURIComponent(keyword)}&location=Israel&geoId=101620260&f_TPR=r86400&start=0`;

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchOne = async (keyword) => {
  try {
    const { data: html } = await axios.get(buildSearchUrl(keyword), {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "en-US,en;q=0.9" },
      timeout: 15000,
    });
    const $ = cheerio.load(html);
    const out = [];

    $("li").each((_, li) => {
      const $li = $(li);
      const a = $li.find("a.base-card__full-link, a[href*='/jobs/view/']").first();
      const url = a.attr("href")?.split("?")[0];
      if (!url || !url.includes("/jobs/view/")) return;

      const title = $li.find("h3, .base-search-card__title").first().text().trim();
      const company = $li.find("h4, .base-search-card__subtitle").first().text().trim();
      const location = $li.find(".job-search-card__location").first().text().trim();
      if (!title || !company) return;

      const canonical = normalizeUrl(url);
      out.push({
        source: "linkedin",
        url,
        url_canonical: canonical,
        url_hash: hashUrl(canonical),
        fingerprint: fingerprintJob(title, company),
        title,
        company,
        location,
        description: "",
        raw: { snippet: $li.text().trim().slice(0, 500), search_keyword: keyword },
      });
    });

    return out;
  } catch (err) {
    const status = err.response?.status;
    console.error(`LinkedIn fetch failed for "${keyword}"${status ? ` [${status}]` : ""}:`, err.message);
    return [];
  }
};

const fetch = async () => {
  const seenHashes = new Set();
  const merged = [];
  for (const keyword of SEARCH_KEYWORDS) {
    const results = await fetchOne(keyword);
    for (const job of results) {
      if (seenHashes.has(job.url_hash)) continue;
      seenHashes.add(job.url_hash);
      merged.push(job);
    }
    // Be a polite scraper: small delay between keyword searches
    await sleep(800);
  }
  return merged;
};

// Hydrate a single job page → description text (used by pipeline before scoring).
const fetchDescription = async (jobUrl) => {
  try {
    const { data: html } = await axios.get(jobUrl, {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "en-US,en;q=0.9" },
      timeout: 15000,
    });
    return html;
  } catch (err) {
    console.error("LinkedIn detail fetch failed:", err.message);
    return "";
  }
};

module.exports = { fetch, fetchDescription };
