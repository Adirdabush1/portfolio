const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../db");
const { normalizeUrl, hashUrl, fingerprintJob } = require("../urlNormalize");
const { extractDescription } = require("../extractText");

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const inferFromHtml = (html) => {
  const $ = cheerio.load(html);
  const ogTitle = $('meta[property="og:title"]').attr("content");
  const ogSite = $('meta[property="og:site_name"]').attr("content");
  const title = ogTitle || $("title").text().trim();
  const company = ogSite || $('meta[name="author"]').attr("content") || "";
  return { title: (title || "").slice(0, 200), company: (company || "").slice(0, 100) };
};

// Reads manual_queue, hydrates each URL to a job record. Marks rows processed.
const fetch = async () => {
  const queue = await db.drainManual();
  const out = [];

  for (const row of queue) {
    try {
      const { data: html } = await axios.get(row.url, {
        headers: { "User-Agent": USER_AGENT },
        timeout: 15000,
      });
      const { title, company } = inferFromHtml(html);
      const description = extractDescription(html);
      const canonical = normalizeUrl(row.url);

      out.push({
        source: "manual",
        url: row.url,
        url_canonical: canonical,
        url_hash: hashUrl(canonical),
        fingerprint: fingerprintJob(title, company),
        title,
        company,
        location: "",
        description,
        raw: { manual_queue_id: row.id },
      });
      await db.markManualProcessed(row.id);
    } catch (err) {
      console.error(`Manual fetch failed [${row.url}]:`, err.message);
      await db.markManualProcessed(row.id);
    }
  }
  return out;
};

module.exports = { fetch };
