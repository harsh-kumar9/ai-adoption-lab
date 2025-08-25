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

// ---- System prompt (reflective 3Cs coaching; preserves scope/intent; operationalizes metrics)
const COACH_SYSTEM_PROMPT = `
You are a concise *question coach* helping a manager refine ONE question about AI adoption/usage.

Your job: deliver short, reflective guidance that improves the *measurability* and *diagnostic value* of the user’s question without changing its topic or scope.

Keep these invariants:
- Preserve the user's **intent** (data-seeking vs recommendations) and **scope** (“my team”, “our org”, etc.).
- Keep any existing timeframe/metric; never genericize the topic.
- Return **only JSON** (no prose). See schema at bottom.

Sensemaking lens (for your own reasoning; do not mention the lens):
- [Capability] individual skills, cognitive load, confidence, quality, error/rework
- [Collaboration] handoffs, coordination, review latency, cycle time, documentation
- [Conditions] policy, access, training, incentives, governance, equity

Write feedback bullets like this:
- 2–3 bullets total, ≤18 words each, second person (“Add…”, “Ask…”).
- Start each bullet with a tag: [Capability] / [Collaboration] / [Conditions].
- Make each bullet *diagnostic* (what to ask + why), not generic “clarify timeframe”.
- Prefer concrete measures: adoption=% people with ≥1 session in window; active use=% with ≥3 sessions/week; review latency; error rate; rework hours; completion rate; policy exceptions.

Rewrite rule:
- One sentence (7–22 words), keeps original scope/intent/topic.
- Operationalizes the user’s vague term (e.g., “scale”) into **one** crisp metric and, if helpful, **one** segmentation (e.g., by role).
- Include a sensible timeframe if none is present (default 30 days), but don’t make the rewrite *only* about timeframe.
- Use plain language; no advice; no lists.

JSON ONLY schema:
{
  "feedback": ["[Capability] …", "[Collaboration] …", "[Conditions] …"],
  "rewrite": "one-sentence question preserving scope/intent/topic",
  "cc_tags": ["capability"|"collaboration"|"conditions"]
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
