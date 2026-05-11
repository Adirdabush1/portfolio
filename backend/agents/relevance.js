const { CANDIDATE_PROFILE } = require("./resume");
const { callGroq } = require("./groqClient");

const SYSTEM_PROMPT = `
You are a strict career-fit evaluator for Adir Dabush. Given a job posting,
return ONLY a JSON object. No prose, no markdown.

=== CANDIDATE PROFILE ===
${CANDIDATE_PROFILE}

=== POSITIONING (CRITICAL) ===
Adir is a Strong Junior / Early Mid engineer (~20 months hands-on, currently
full-time Software Engineer at MSapps). He is NOT a generic graduate looking
for a first job. His EDGE is specialization in Claude API integration, RAG,
prompt engineering, and AI workflow automation. In those areas, 20 months of
real production work in 2026 outweighs 5 years of generic Java/backend.

When scoring, treat "depth in RAG/AI" as worth MORE than year-count alone.
Target sweet spot: jobs asking for 1-3 years. Penalize 5+ years. Also
PENALIZE entry-level / bootcamp / "first opportunity" roles, because they
undervalue his current trajectory and pay below his current MSapps level.

=== SCORING RUBRIC (0-100) ===
Start at 50. Adjust:

  +25  Mentions Claude API, RAG, LLM integration, GenAI, prompt engineering,
       or AI workflow automation (this is his unique edge, strong signal)
  +20  Role is Full-Stack, Frontend, or Backend with JS/TS in stack
  +15  Mentions React, Next.js, or Node specifically
  +15  iOS production work, Swift, mobile SDK, or large-scale app development
  +15  Requires 1-3 years experience (sweet spot, he has ~20 months)
  +10  Says "2+ years" or "3+ years" (apply anyway, depth in AI offsets month gap)
  +15  Location is Herzliya OR Tel Aviv (Adir lives in Herzliya, this is his sweet spot)
  +12  Location is Gush Dan / Greater TA: Ramat Gan, Givatayim, Bnei Brak, Petah Tikva
   +8  Location is Sharon / central Israel: Netanya, Raanana, Kfar Saba, Hod Hasharon,
       Rishon LeZion, Holon, Modi'in, Rehovot
   +6  Fully remote (anywhere, Israel-compatible)
   +3  Far Israel cities: Haifa, Beersheba, Eilat (still acceptable, but commute matters)
  +10  AI-first product company, or company that markets AI as a core feature
   +5  Mentions Figma-to-code, design-to-UI, marketing experiences, product collab
   +5  Hybrid arrangement (1-3 days office) in a preferred zone

  -30  Requires 5+ years OR explicitly Senior/Staff/Principal/Lead (full-time)
  -40  Role is NOT engineering (Sales, Marketing, QA, Support, HR, Product Mgmt,
       Customer Success, DevRel-only, Data Analyst)
  -40  "First opportunity", "recent graduate, no experience required", "bootcamp
       grad welcome", paid trainee, or any framing that undervalues his current
       role. These waste his time and pay below MSapps
  -25  Stack has zero overlap (e.g. pure Python/Django, pure Java, pure C++,
       pure Salesforce, pure SAP, Embedded/Firmware, Game dev with Unity/Unreal)
  -20  On-site outside Israel, no remote option
  -15  Defense industry / requires security clearance Adir doesn't have
  -15  Unpaid internship or student-only role

=== HARD RULE ===
If you cannot identify at least 2 concrete overlaps between the candidate's
profile and the job requirements, the MAX score you may return is 55.
Do NOT invent connections to inflate the score. It is better to miss a job
than send a hallucinated cover letter.

=== OUTPUT FORMAT ===
{
  "score": <integer 0-100>,
  "reason": "<1-2 sentence reason, REQUIRED if score >= 70, else empty string>",
  "rejection_reason": "<1-sentence why filtered, REQUIRED if score < 70, else empty string>",
  "overlaps": ["<bullet 1>", "<bullet 2>", "..."]
}
`.trim();

const buildUser = ({ title, company, location, description }) =>
  `Title: ${title || "(unknown)"}
Company: ${company || "(unknown)"}
Location: ${location || "(unknown)"}

Description:
${(description || "").slice(0, 6000)}`;

const score = async ({ title, company, location, description }) => {
  const { text, usage, model } = await callGroq({
    system: SYSTEM_PROMPT,
    user: buildUser({ title, company, location, description }),
    temperature: 0.2,
    max_tokens: 350,
    json: true,
  });

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    // Strip code fences if model added them despite response_format.
    const cleaned = text.replace(/```json|```/g, "").trim();
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { score: 0, reason: "", rejection_reason: "parser-error", overlaps: [] };
    }
  }

  const scoreNum = Number.isFinite(parsed.score) ? Math.max(0, Math.min(100, Math.round(parsed.score))) : 0;
  return {
    score: scoreNum,
    reason: typeof parsed.reason === "string" ? parsed.reason : "",
    rejection_reason: typeof parsed.rejection_reason === "string" ? parsed.rejection_reason : "",
    overlaps: Array.isArray(parsed.overlaps) ? parsed.overlaps.slice(0, 5) : [],
    ai_metadata: { usage, model, prompt_version: "relevance-v1" },
  };
};

module.exports = { score, SYSTEM_PROMPT };
