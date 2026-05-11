const { CANDIDATE_PROFILE } = require("./resume");
const { callGroq } = require("./groqClient");

const GENERIC_BLACKLIST = [
  "passionate", "synergy", "team player", "dynamic",
  "go-getter", "hit the ground running", "wear many hats",
  "rockstar", "ninja", "guru", "thought leader",
  // anti-junior framing: these undersell Adir's specialization
  "junior", "limited experience", "early in my career",
  "eager to learn", "looking for opportunity", "entry level",
  // em-dash: causes encoding issues and signals AI authorship
  "—",
];

const SYSTEM_PROMPT = `
You are writing a cold-application email FROM Adir Dabush TO a recruiter or
hiring manager. The email must feel hand-written by a thoughtful candidate —
not by an AI.

=== CANDIDATE PROFILE ===
${CANDIDATE_PROFILE}

=== POSITIONING (CRITICAL) ===
Adir is ~20 months into his career but already a full-time Software Engineer
at MSapps building large-scale iOS apps with AI integration. His SUPERPOWER
is depth in Claude API + RAG + LLM integration. This domain barely existed
2 years ago, and his hands-on production experience is RARE in the market.

NEVER apologize for years of experience. NEVER write "early in my career",
"despite my limited experience", "junior developer", or anything that
discounts him. Lead with the specialty, not the seniority. If the job asks
for "3+ years" and he has 20 months, the email IGNORES that gap and instead
highlights the AI/RAG depth that most 5-year engineers do NOT have.

=== STYLE RULES ===
- 4 paragraphs, ~120-180 words total.
- Open with a single specific sentence about why THIS company/role caught attention.
  Reference something concrete about THEIR product/stack/AI angle.
- Paragraph 2 + 3: weave in the EXACT two overlap points provided. Name a
  specific MSapps/AnyApp/CodeMode shipped result alongside the JD requirement.
  When relevant, lean hard into Claude/RAG/LLM specialization. That's the
  hook that converts "another applicant" into "let's talk".
- Close with: "Portfolio: https://portfolio-eup2.onrender.com. Happy to jump on a 15-min call."
- Sign as "Adir Dabush".
- Tone: warm, confident, specific. NO generic phrases.
- NEVER use: passionate, synergy, team player, dynamic, go-getter, rockstar, ninja, wear many hats.
- NEVER use: "junior", "limited experience", "early in my career", "eager to learn", "looking for opportunity".
- NEVER use em-dashes (—). Use a regular hyphen (-), colon (:), comma, or split the sentence.
- Plain text. No markdown. No bullets.

=== OUTPUT FORMAT ===
Return JSON only:
{
  "subject": "<short subject line, max 80 chars, no clickbait>",
  "body": "<the email body, 4 paragraphs, plain text>"
}
`.trim();

const containsGeneric = (text) => {
  const lower = text.toLowerCase();
  return GENERIC_BLACKLIST.some((w) => lower.includes(w));
};

const buildUser = ({ job, overlaps }) =>
  `Job:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location || "(unspecified)"}

Description:
${(job.description || "").slice(0, 4000)}

Two overlap points to weave into the email (use BOTH, do not invent new ones):
1. ${overlaps[0] || "(missing)"}
2. ${overlaps[1] || "(missing)"}`;

// Composes one personalized email. Re-rolls once if the model leaks generic phrases.
const compose = async ({ job, overlaps }) => {
  if (!overlaps || overlaps.length < 2) {
    return { error: "insufficient-overlaps" };
  }

  const attempt = async (temp) => {
    const { text, usage, model } = await callGroq({
      system: SYSTEM_PROMPT,
      user: buildUser({ job, overlaps }),
      temperature: temp,
      max_tokens: 600,
      json: true,
    });
    let parsed;
    try {
      parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      return { error: "parser-error", raw: text };
    }
    return {
      subject: String(parsed.subject || "").trim().slice(0, 200),
      body: String(parsed.body || "").trim(),
      ai_metadata: { usage, model, prompt_version: "composer-v1", temperature: temp },
    };
  };

  let result = await attempt(0.6);
  if (result.error) return result;

  if (containsGeneric(result.body)) {
    const reroll = await attempt(0.4);
    if (!reroll.error && !containsGeneric(reroll.body)) {
      reroll.ai_metadata.rerolled = true;
      return reroll;
    }
  }
  return result;
};

module.exports = { compose, SYSTEM_PROMPT, GENERIC_BLACKLIST };
