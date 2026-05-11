// Hard pre-filter: drop jobs that aren't in Israel and aren't remote.
// Runs BEFORE the Groq relevance call, so we don't pay tokens on
// irrelevant geographies.

const ISRAEL_KEYWORDS = [
  // Country
  "israel", "ישראל",
  // Major cities (English)
  "tel aviv", "tel-aviv", "tlv", "herzliya", "herzeliya",
  "jerusalem", "haifa", "netanya", "ramat gan", "ramat-gan",
  "petah tikva", "petach tikva", "rishon lezion", "rishon le zion",
  "beersheba", "beer sheva", "ashdod", "holon", "bnei brak",
  "raanana", "ra'anana", "kfar saba", "modiin", "modi'in",
  "givatayim", "rehovot", "kiryat", "ashkelon", "yokneam",
  "caesarea", "nazareth", "eilat",
  // Hebrew cities
  "תל אביב", "תל-אביב", "הרצליה", "ירושלים", "חיפה", "נתניה",
  "רמת גן", "פתח תקווה", "ראשון לציון", "באר שבע", "אשדוד",
  "חולון", "בני ברק", "רעננה", "כפר סבא", "מודיעין", "גבעתיים",
  "רחובות", "אשקלון", "יוקנעם",
];

const REMOTE_KEYWORDS = [
  "remote", "fully remote", "100% remote", "wfh", "work from home",
  "work from anywhere", "distributed", "anywhere in the world",
  "global remote", "telecommute", "telework",
];

// Locations that signal NOT-Israel + NOT-Israel-friendly. Used when text
// also lacks any remote indicator. If matched: hard reject.
const FOREIGN_ONLY_RED_FLAGS = [
  "us only", "us-only", "us citizens only", "must be in the us",
  "must reside in the us", "work authorization in the us",
  "uk only", "uk-only", "must be in the uk", "right to work in the uk",
  "eu only", "eu-only", "must be in the eu", "european union only",
  "must be in canada", "canadian only", "must be in india",
  "must be in germany", "must be in france",
];

const lower = (s) => (s || "").toLowerCase();

// Returns one of: 'pass-israel', 'pass-remote', 'reject-foreign-only', 'reject-no-signal'
const classify = ({ title, location, description }) => {
  const haystack = `${lower(title)} ${lower(location)} ${lower(description)}`;

  for (const kw of REMOTE_KEYWORDS) {
    if (haystack.includes(kw)) {
      // Remote, but check that it's not "Remote (US-only)" type
      for (const rf of FOREIGN_ONLY_RED_FLAGS) {
        if (haystack.includes(rf)) return "reject-foreign-only";
      }
      return "pass-remote";
    }
  }
  for (const kw of ISRAEL_KEYWORDS) {
    if (haystack.includes(kw)) return "pass-israel";
  }
  for (const rf of FOREIGN_ONLY_RED_FLAGS) {
    if (haystack.includes(rf)) return "reject-foreign-only";
  }
  return "reject-no-signal";
};

const passes = (job) => {
  const verdict = classify(job);
  return { passes: verdict.startsWith("pass"), verdict };
};

module.exports = { classify, passes };
