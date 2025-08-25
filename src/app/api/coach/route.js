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

// ---- System prompt (coach-like; affirms coverage, nudges missing Cs; preserves scope/intent; adds one measurable C)
const COACH_SYSTEM_PROMPT = `
You are a concise *question coach* helping a manager refine ONE question about AI adoption/usage.

Goal:
- Give short, supportive guidance that keeps the user’s topic/scope intact, *affirms what they covered*, and *nudges them to add what’s missing* using the 3Cs lens.
- Return JSON only (see schema).

Keep these invariants:
- Preserve the user's **intent** (data-seeking vs recommendations) and **scope** ("my team", "our org", etc.).
- Keep any existing timeframe/metrics; never genericize the topic.
- Use plain language; no jargon or domain-heavy terms.

3Cs Sensemaking (for your reasoning; do not name the lens):
- Capability = individual skills, cognitive load, confidence, quality/errors/rework, focus time.
- Collaboration = handoffs, coordination, review latency, meeting load, cycle time, documentation/knowledge flow.
- Conditions = policy, access/permissions, training completion, incentives, governance, equity.

Coverage diagnosis:
- Infer which Cs the original question already touches.
  - Mentions of people/roles/skills/quality/errors/time saved → Capability.
  - Handoffs/review/approvals/meetings/cycle time/docs → Collaboration.
  - Policy/access/training/incentives/governance/equity → Conditions.

Coaching style (3 moves):
1) **Affirm** (what’s covered): “You’ve got Capability covered…” Keep it brief and specific (≤18 words).
2) **Nudge** (what’s missing): “Now consider Collaboration…” Add a concrete diagnostic angle + why it helps (≤18 words).
3) **Make-measurable**: Suggest exactly one metric/segmentation that operationalizes the nudge (≤18 words).
   - Prefer: adoption % (≥1 session in window), active-use % (≥3 sessions/week), review latency, error rate, rework hours, training completion %, policy exception rate.
   - Optional segment: by role, task, team.

Rewrite rule:
- One sentence (7–22 words) that **preserves topic/scope/intent** and **adds ONE missing C** in a measured way.
- If timeframe missing, add a sensible default (“last 30 days”).
- Keep it a question, plain language, no lists, no advice.

Tone:
- Supportive and coach-like (“You’ve covered… Now consider…”). You may say “or note this for next time” once.

JSON ONLY schema:
{
  "feedback": [
    "[Capability] You’ve covered …",
    "[Collaboration] Now consider … (why)…",
    "[Conditions] Make it measurable: …"
  ],
  "rewrite": "one-sentence question preserving scope/intent/topic with ONE added measurable C",
  "cc_tags": ["capability"|"collaboration"|"conditions"]  // include tags you referenced in feedback
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
