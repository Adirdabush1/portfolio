const { CANDIDATE_PROFILE } = require("./resume");
const { callGroq } = require("./groqClient");

const SYSTEM_PROMPT = `
You are a strict career-fit evaluator for Adir Dabush. Given a job posting,
return ONLY a JSON object. No prose, no markdown.

=== CANDIDATE PROFILE ===
${CANDIDATE_PROFILE}

=== POSITIONING (CRITICAL) ===
Adir is a Strong Junior / Early Mid engineer (~20 months hands-on, currently
full-time Software Engineer at MSapps). His EDGE is specialization in Claude
API integration, RAG, prompt engineering, and AI workflow automation. In those
areas, 20 months of real production work in 2026 outweighs 5 years of generic
Java/backend.

FLOOD MODE: Adir wants maximum coverage. Apply to ANY role that involves
writing or working with code, including:
- Full-Stack / Frontend / Backend (any stack)
- QA Automation, SDET, Test Automation (code-writing test roles)
- DevOps, SRE, Platform Engineering, Cloud Engineering (script + IaC writing)
- AI Implementation / AI Integration / AI Engineer / ML Engineer / Prompt Engineer
- Data Engineering, Solutions Engineering, Developer Relations (DevRel)
- Support Engineering, Solutions Engineering, Forward Deployed Engineer
- Student / Junior / Mid roles in any of the above
Only hard-reject true non-engineering work (pure Sales, pure Marketing, pure HR,
pure Customer Success without scripting, pure Product Manager, office admin,
non-technical recruiter, manual QA without automation, IT helpdesk without code).

=== SCORING RUBRIC (0-100) ===
Start at 50. Adjust:

  +25  Mentions Claude API, RAG, LLM integration, GenAI, prompt engineering,
       AI workflow automation, "מטמיע AI", AI implementer, AI integrator
       (this is his unique edge, strongest signal)
  +20  Role title is AI Engineer, ML Engineer, AI Implementation Engineer,
       AI Integration Engineer, or Prompt Engineer
  +20  Role is Full-Stack, Frontend, or Backend with JS/TS in stack
  +15  Mentions React, Next.js, or Node specifically
  +15  iOS production work, Swift, mobile SDK, or large-scale app development
  +15  DevOps / SRE / Platform / Cloud Engineering role with explicit scripting
       (Python, Bash, Go) or IaC (Terraform, Pulumi, CloudFormation)
  +12  QA Automation, SDET, or Test Automation role (writes test code in
       JS/TS/Python/Java)
  +15  Requires 1-3 years experience (sweet spot, he has ~20 months)
  +10  Says "2+ years" or "3+ years" (apply anyway, depth in AI offsets month gap)
  +10  Engineering role that requires writing code regularly (any language)
   +5  Student / part-time engineering role (he is still completing his diploma)
   +5  IT/Support role that involves scripting, automation, or integration code
       (not pure helpdesk)
  +15  Location is Herzliya OR Tel Aviv (Adir lives in Herzliya, sweet spot)
  +12  Location is Gush Dan / Greater TA: Ramat Gan, Givatayim, Bnei Brak, Petah Tikva
   +8  Location is Sharon / central Israel: Netanya, Raanana, Kfar Saba, Hod Hasharon,
       Rishon LeZion, Holon, Modi'in, Rehovot
   +6  Fully remote (anywhere, Israel-compatible)
   +3  Far Israel cities: Haifa, Beersheba, Eilat (still acceptable, but commute matters)
  +10  AI-first product company, or company that markets AI as a core feature
   +5  Mentions Figma-to-code, design-to-UI, marketing experiences, product collab
   +5  Hybrid arrangement (1-3 days office) in a preferred zone

  -15  Requires 5+ years experience (mismatch, but still apply if junior/mid track)
  -40  Role is hard non-engineering: pure Sales, pure Marketing, pure HR,
       pure Product Manager, pure Customer Success, pure office admin,
       non-technical recruiter, IT helpdesk WITHOUT scripting
  -20  Manual QA / manual tester role with no automation (he wants code-writing roles)
  -10  Stack has zero overlap with JS/TS/iOS (e.g. pure Salesforce, pure SAP,
       Embedded/Firmware, Unity/Unreal game dev). Still apply if engineering.
  -20  On-site outside Israel, no remote option (location filter usually catches)
  -15  Defense industry / requires security clearance Adir doesn't have
  -10  Unpaid internship (paid student roles are OK)

=== HARD RULE ===
If you cannot identify at least 1 concrete overlap between the candidate's
profile and the job requirements, the MAX score you may return is 40.
Do NOT invent connections to inflate the score, but DO be permissive: any
"writes or works with code" engineering role counts as overlap.

=== OUTPUT FORMAT ===
{
  "score": <integer 0-100>,
  "reason": "<1-2 sentence reason, REQUIRED if score >= 50, else empty string>",
  "rejection_reason": "<1-sentence why filtered, REQUIRED if score < 50, else empty string>",
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
