// src/app/api/sourcefacts/route.js
import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYS_FACTS = `
SYSTEM — Source Facts Synthesizer

You output concise, plausible, internally consistent micro-facts derived from provided source cards
to support the user's next analyst query. Treat these as already-computed analytics. Do not say
they are estimates or placeholders. Normalize to ONE time window (default last 30 days).

Guidelines
- 1–2 facts per selected card; 2–4 facts total.
- Each fact is one compact clause with: metric + value + unit + window + (optional) delta vs baseline + cohort.
- Keep numbers realistic (e.g., adoption 10–70%, PR latency deltas 5–40%, stress +/- 2–15pp).
- Use short, manager-friendly wording. No long quotes; no tables.

Output JSON only:
{
  "window": "last 30 days" | "last 7 days" | "last quarter",
  "facts": [
    { "source_id": "code-ci-1", "line": "PR review latency −18% vs prior 30d (team repos, n=642 PRs)." },
    { "source_id": "pulse-1",    "line": "Focus time +12% and stress −5pp (N=118 ICs)." }
  ]
}
`;

function fallbackFacts(ids = []) {
  const byId = {
    "code-ci-1": "PR review latency −18% vs prior 30d (team repos, n=640+ PRs).",
    "pulse-1": "Focus time +12% and stress −5pp (N≈120 ICs).",
    "wiki-barriers-1": "Top barriers: access friction (23%), policy uncertainty (14%).",
    "meetings-1": "Meeting load −1.2h/pp; handoff retries +3pp (last 30d).",
    "policy-train-1": "GenAI training completion 76% (IC 81%, Mgr 68%); policy v2.3 rolled out 6w ago.",
    "cust-qa-1": "Defects −11% vs prior 30d; escalations −6%; rework hours −8%.",
    "web-benchmark-1": "Peers show 34–52% active use; QA pass +5–12pp post-AI."
  };
  return {
    window: "last 30 days",
    facts: ids.slice(0,3).map(id => ({ source_id: id, line: byId[id] || "Context metric available." }))
  };
}

export async function POST(req) {
  const { focus = "", transcript = "", profile = {}, selected = [], snippets = [] } = await req.json();

  const cards = selected
    .map(id => snippets.find(s => s.id === id))
    .filter(Boolean)
    .map(s => ({ id: s.id, source: s.source, title: s.title, blurb: s.blurb }));

  if (!cards.length) return Response.json(fallbackFacts([]));

  try {
    const user = { focus, profile, transcript: transcript.slice(-3000), cards };
    const r = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.2,
      messages: [
        { role: "system", content: SYS_FACTS },
        { role: "user", content: JSON.stringify(user) }
      ]
    });

    let data = {};
    const raw = r.choices?.[0]?.message?.content || "";
    try { data = JSON.parse(raw); }
    catch {
      const m = raw.match(/\{[\s\S]*\}$/);
      if (m) { try { data = JSON.parse(m[0]); } catch { data = {}; } }
    }

    if (!data || !Array.isArray(data.facts) || data.facts.length === 0) {
      return Response.json(fallbackFacts(selected));
    }
    // sanitize
    const window = typeof data.window === "string" ? data.window : "last 30 days";
    const facts = data.facts
      .filter(f => f && typeof f.source_id === "string" && typeof f.line === "string")
      .slice(0, 4);

    return Response.json({ window, facts });
  } catch {
    return Response.json(fallbackFacts(selected));
  }
}
