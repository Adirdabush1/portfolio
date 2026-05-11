const cheerio = require("cheerio");

// Selectors most job sites use for the description block. Tried in order.
const DESCRIPTION_SELECTORS = [
  '[class*="description"]',
  '[class*="jobDescription"]',
  '[id*="description"]',
  '[class*="job-details"]',
  "article",
  "main",
];

const collapseWhitespace = (s) =>
  s.replace(/\s+/g, " ").replace(/\n{3,}/g, "\n\n").trim();

// Returns plain innerText of the job description block.
// Falls back to full <body> innerText if no targeted selector matches.
const extractDescription = (html) => {
  if (!html || typeof html !== "string") return "";
  const $ = cheerio.load(html);
  $("script, style, noscript, nav, header, footer").remove();

  for (const sel of DESCRIPTION_SELECTORS) {
    const node = $(sel).first();
    if (node.length && node.text().trim().length > 200) {
      return collapseWhitespace(node.text()).slice(0, 8000);
    }
  }
  return collapseWhitespace($("body").text()).slice(0, 8000);
};

module.exports = { extractDescription };
