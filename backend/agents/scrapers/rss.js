const Parser = require("rss-parser");
const { normalizeUrl, hashUrl, fingerprintJob } = require("../urlNormalize");

const parser = new Parser({ timeout: 15000 });

// Public RSS feeds. Add carefully — confirm each one's ToS allows automated fetch.
const FEEDS = [
  { name: "rss:remoteok",       url: "https://remoteok.com/remote-dev-jobs.rss" },
  { name: "rss:weworkremotely", url: "https://weworkremotely.com/categories/remote-programming-jobs.rss" },
];

const parseCompanyFromTitle = (title) => {
  // RemoteOK / WWR titles often look like "Senior Engineer at CompanyName"
  const m = title?.match(/\s+at\s+(.+)$/i);
  return m ? m[1].trim() : null;
};

const fetchOne = async (feed) => {
  try {
    const result = await parser.parseURL(feed.url);
    return (result.items || []).map((item) => {
      const url = item.link || item.guid;
      const canonical = normalizeUrl(url);
      const title = item.title?.replace(/\s+at\s+.+$/i, "").trim() || "";
      const company = parseCompanyFromTitle(item.title) || item.creator || "";
      return {
        source: feed.name,
        url,
        url_canonical: canonical,
        url_hash: hashUrl(canonical),
        fingerprint: fingerprintJob(title, company),
        title,
        company,
        location: item.categories?.join(", ") || "Remote",
        description: item.contentSnippet || item.content || "",
        raw: { feed: feed.name, isoDate: item.isoDate, link: item.link },
      };
    });
  } catch (err) {
    console.error(`RSS fetch failed [${feed.name}]:`, err.message);
    return [];
  }
};

const fetch = async () => {
  const results = await Promise.all(FEEDS.map(fetchOne));
  return results.flat();
};

module.exports = { fetch };
