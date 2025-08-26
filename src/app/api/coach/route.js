// src/app/api/proto/coach/route.js
import { NextResponse } from "next/server";

/** Plug your OpenAI client here */
async function callLLM({ system, user }) {
  // Example with fetch; replace with your OpenAI SDK if you prefer.
  const apiKey = process.env.OPENAI_API_KEY;
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0,
    }),
  });
  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content || "";
  return text;
}

// ---- System prompt (coach-like; intent inference; 3Cs enrichment; systems-level rewrite)
const COACH_SYSTEM_PROMPT = `
You are a concise *question coach* helping a manager refine ONE question about AI adoption/usage.

Purpose
- Understand what the manager is really trying to learn or decide.
- Affirm what their question already covers, then enrich it using the 3Cs so it captures interactions and context.
- Produce a better, systems-aware question. The rewrite may change wording or add missing elements if it preserves the core topic/scope.

Do NOT do:
- Do not lecture about “adding a timeframe” or “make it measurable” unless it is central to the user’s intent.
- Do not give advice or steps; this is about asking a better question.
- Avoid generic prompts like “clarify X”; be specific and grounded in the user’s topic.

3Cs sensemaking (for your reasoning; do not name the lens):
- Capability: individual skills, cognitive load, confidence, quality/errors/rework, focus time.
- Collaboration: handoffs, coordination, review latency, meeting load, cycle time, documentation/knowledge flow.
- Conditions: policy, access/permissions, training, incentives, governance, equity.

Detect coverage from the original:
- People/skills/quality/errors/time saved → Capability.
- Handoffs/reviews/approvals/meetings/cycle time/docs → Collaboration.
- Policy/access/training/incentives/governance/equity → Conditions.

Coaching moves (keep it supportive and specific):
1) **Affirm** what they already asked well (≤18 words), e.g., “You’ve covered Capability by focusing on IC experience/quality.”
2) **Nudge** a missing or underplayed C (≤18 words) with a why, e.g., “Add Collaboration to see how reviews/hand-offs shape the outcome.”
3) **Link** across layers (≤18 words): name a likely interaction or contrast (e.g., “training gaps may explain role differences”).

Rewrite rule
- One sentence (≈12–28 words), plain language, still a question.
- Preserve topic and scope cues (“my team”, “our org”) but you may add missing layers/relationships to make it systems-level.
- Prefer a question that connects the original target to one other C and a plausible mechanism or contrast (e.g., by role/team/policy change).

Tone
- Supportive and non-judgmental: “You’ve covered… Now consider… You could link…”
- You may say “or note this for next time” once.

Output JSON ONLY:
{
  "feedback": ["[Capability] …", "[Collaboration] …", "[Conditions] …"],   // 2–3 bullets total, tagged to the Cs you used
  "rewrite": "one-sentence systems-aware question that preserves topic/scope while adding missing context",
  "cc_tags": ["capability"|"collaboration"|"conditions"]                     // include tags you referenced
}
`;



// Helper to stringify persona succinctly for the user turn.
function personaText(profile) {
  const level =
    { ic: "IC", manager: "Manager", director: "Director/Head", vp: "VP/C-suite" }[profile?.org_level] || "Manager";
  const span =
    { individual: "individual", team: "team", org: "org", policy: "policy" }[profile?.span] || "team";
  const numeracy = profile?.numeracy ?? 2;
  return `Persona: level=${level}, span=${span}, numeracy=${numeracy}.`;
}

export async function POST(req) {
  try {
    const { query, profile } = await req.json();

    const userTurn = `
${personaText(profile)}
Original question: """${query?.trim() || ""}"""
Return JSON as specified.`;

    const raw = await callLLM({ system: COACH_SYSTEM_PROMPT, user: userTurn });

    // Best-effort parse; guard against model drift.
    let out = { feedback: [], rewrite: "", cc_tags: [] };
    try {
      out = JSON.parse(raw);
    } catch {
      // naive recovery: look for a fenced block or a line starting with {
      const m = raw.match(/\{[\s\S]*\}$/m);
      if (m) out = JSON.parse(m[0]);
    }

    // Minimal sanity checks
    if (!Array.isArray(out.feedback)) out.feedback = [];
    if (typeof out.rewrite !== "string") out.rewrite = "";
    if (!Array.isArray(out.cc_tags)) out.cc_tags = [];

    return NextResponse.json(out);
  } catch (e) {
    return NextResponse.json(
      {
        feedback: [
          "[Capability] Keep the team focus and ask for measurable usage by task/role.",
          "[Collaboration] Consider handoffs or review points that changed post-AI.",
        ],
        rewrite: "Within my team, which tasks use AI weekly by role, and how has review time changed?",
        cc_tags: ["capability", "collaboration"],
      },
      { status: 200 }
    );
  }
}
