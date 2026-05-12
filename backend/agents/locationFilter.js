// Hard pre-filter: keep only jobs that are clearly in Israel OR clearly
// worldwide-remote. Generic "remote" alone is NOT enough, because most
// listings tagged "remote" in 2026 mean "remote within our country" (usually
// US). Adir does not want US-only or EU-only remote.

const ISRAEL_KEYWORDS = [
  "israel", "ישראל",
  "tel aviv", "tel-aviv", "tlv", "herzliya", "herzeliya",
  "jerusalem", "haifa", "netanya", "ramat gan", "ramat-gan",
  "petah tikva", "petach tikva", "rishon lezion", "rishon le zion",
  "beersheba", "beer sheva", "ashdod", "holon", "bnei brak",
  "raanana", "ra'anana", "kfar saba", "modiin", "modi'in",
  "givatayim", "rehovot", "kiryat", "ashkelon", "yokneam",
  "caesarea", "nazareth", "eilat",
  "תל אביב", "תל-אביב", "הרצליה", "ירושלים", "חיפה", "נתניה",
  "רמת גן", "פתח תקווה", "ראשון לציון", "באר שבע", "אשדוד",
  "חולון", "בני ברק", "רעננה", "כפר סבא", "מודיעין", "גבעתיים",
  "רחובות", "אשקלון", "יוקנעם",
];

const WORLDWIDE_REMOTE_SIGNALS = [
  "anywhere in the world", "worldwide remote", "remote worldwide",
  "global remote", "remote, anywhere", "remote anywhere",
  "work from anywhere", "anywhere remote", "remote globally",
  "remote, global", "fully remote, anywhere",
  "any country", "any timezone", "any time zone",
  "remote (worldwide)", "remote (global)", "remote (anywhere)",
  "international remote", "remote: worldwide", "remote: global",
];

const FOREIGN_ONLY_RED_FLAGS = [
  "us only", "us-only", "us based", "us-based", "based in the us",
  "us citizens", "us citizen", "must be in the us", "must be in the united states",
  "must reside in the us", "located in the us", "located in the united states",
  "work authorization in the us", "authorized to work in the us",
  "authorized to work in the united states", "eligible to work in the united states",
  "must have us work authorization", "must be a us resident",
  "americas only", "americas-based", "north america only", "us/canada", "us & canada",
  "est hours", "pst hours", "edt hours", "pdt hours", "cst hours",
  "eastern time", "pacific time", "central time", "mountain time",
  "et timezone", "pt timezone", "us timezone", "us time zone",
  "san francisco only", "new york only", "nyc only",
  "uk only", "uk-only", "uk based", "uk-based", "based in the uk",
  "must be in the uk", "right to work in the uk",
  "eu only", "eu-only", "eu based", "eu-based", "based in the eu",
  "must be in the eu", "european union only", "must be in europe",
  "canada only", "canadian only", "must be in canada",
  "india only", "must be in india", "based in india",
  "germany only", "must be in germany", "based in germany",
  "australia only", "must be in australia",
];

const lower = (s) => (s || "").toLowerCase();
const has = (haystack, needles) => needles.some((n) => haystack.includes(n));

const classify = ({ title, location, description }) => {
  const haystack = `${lower(title)} ${lower(location)} ${lower(description)}`;

  if (has(haystack, FOREIGN_ONLY_RED_FLAGS)) return "reject-foreign-only";
  if (has(haystack, ISRAEL_KEYWORDS)) return "pass-israel";
  if (has(haystack, WORLDWIDE_REMOTE_SIGNALS)) return "pass-worldwide-remote";

  // Generic "remote" with no Israel and no worldwide signal: REJECT.
  // Most 2026 "remote" jobs are de facto US-only without saying so.
  return "reject-no-explicit-israel-or-worldwide";
};

const passes = (job) => {
  const verdict = classify(job);
  return { passes: verdict.startsWith("pass"), verdict };
};

module.exports = { classify, passes };
