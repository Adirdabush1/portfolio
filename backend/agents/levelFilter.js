// Hard level filter: reject senior+ titles before AI scoring. Adir is an
// early-mid engineer; senior/lead/principal/staff postings are not a fit
// and the AI sometimes lets them slip through.

const JUNIOR_MID_SIGNALS = [
  // English
  /\bjunior\b/i, /\bjr\.?\b/i, /\bentry[- ]?level\b/i, /\bgraduate\b/i,
  /\bstudent\b/i, /\bintern(ship)?\b/i,
  /\bmid[- ]?level\b/i, /\bmid[- ]?senior\b/i, /\bintermediate\b/i,
  /\b(software\s+engineer|sw\s+engineer)\s*(i|1|ii|2)\b/i,
  /\bassociate\b/i,
  // Hebrew
  /ג['׳]וניור/, /ג['׳]וניורית/, /מתחיל(ה)?/, /סטודנט(ית)?/,
  /ראשוני(ת)?/, /התמחות/, /חניך/,
];

const SENIOR_PLUS_SIGNALS = [
  // English: explicit senior+ levels
  /\bsenior\b/i, /\bsr\.?\b/i, /\blead\b/i, /\bprincipal\b/i,
  /\bstaff\s+(engineer|software|developer)/i,
  /\barchitect\b/i, /\bdirector\b/i, /\bhead\s+of\b/i,
  /\bmanager\b/i, /\bvp\b/i, /\bcto\b/i, /\bcio\b/i,
  /\b(software\s+engineer|sw\s+engineer)\s*(iii|3|iv|4|v|5)\b/i,
  /\b(7|8|9|10|11|12|15)\+?\s*years?\b/i,
  /\b(seven|eight|nine|ten)\+?\s*years?\b/i,
  // Hebrew
  /\bסניור(ית)?\b/, /מוביל(ה)?\s+(פיתוח|טכני|טכנולוגי)/,
  /ראש\s+צוות/, /מנהל(ת)?\s+(פיתוח|צוות|טכנולוגי)/,
  /סמנכ['׳"]ל/, /סמנכל/, /אדריכל(ית)?/,
];

const lower = (s) => String(s || "").toLowerCase();
const anyMatch = (text, patterns) => patterns.some((re) => re.test(text));

// Classify the seniority of a job by looking at the title primarily and the
// first ~500 chars of description for explicit level callouts.
const classify = ({ title, description }) => {
  const t = lower(title);
  const head = lower(description).slice(0, 500);
  const probe = `${t}\n${head}`;

  const hasJuniorMid = anyMatch(probe, JUNIOR_MID_SIGNALS);
  const hasSeniorPlus = anyMatch(probe, SENIOR_PLUS_SIGNALS);

  // Explicit junior/mid signal overrides senior callouts in the SAME post
  // (e.g. "Mid Level/Senior/Lead" — open to mid candidates too).
  if (hasJuniorMid) return "pass-junior-mid";
  if (hasSeniorPlus) return "reject-senior-plus";
  return "pass-unknown-level";
};

const passes = (job) => {
  const verdict = classify(job);
  return { passes: verdict.startsWith("pass"), verdict };
};

module.exports = { classify, passes };
