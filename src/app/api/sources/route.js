// src/app/api/sources/route.js
import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYS_RERANK = `
SYSTEM — Source Reranker + 3Cs Tagger (LLM-only)

Pick up to 3 cards that best help the analyst answer the user's NEXT query and explain likely mechanisms across:
• Capability (individual: skill, cognitive load, time-on-task, quality, confidence)
• Collaboration (workflow: handoffs, reviews/QA, cycle time, coordination, knowledge sharing)
• Conditions (environment: policy, incentives, access, governance, training, equity)

Return JSON only:
{
  "ids": ["id1","id2"],                           // max 3 from candidates
  "rationales": ["≤12 words each","..."],         // why each card helps
  "coverage": {"cap": true|false, "collab": true|false, "cond": true|false} // multi-label for THIS turn
}

Rules
- Consider the user's focus + recent transcript + profile.
- Prefer diversity: do not pick three cards that all say the same thing.
- Choose cards whose plausible facts would directly reduce uncertainty or connect causes to outcomes.
- Do not mention or output the 3Cs labels beyond the JSON booleans above.
- Output JSON ONLY. No prose. No code fences.
`;

function safeFallback(snippets) {
  const ids = snippets.slice(0, 3).map(s => s.id);
  return {
    ids,
    rationales: ids.map(() => "generic coverage"),
    coverage: { cap: true, collab: true, cond: false }
  };
}

export async function POST(req) {
  const { focus = "", transcript = "", profile = {}, snippets = [] } = await req.json();

  const candidates = snippets.map(s => ({
    id: s.id, source: s.source, title: s.title, blurb: s.blurb
  }));

  try {
    const r = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.1,
      messages: [
        { role: "system", content: SYS_RERANK },
        { role: "user", content: JSON.stringify({ focus, profile, transcript: transcript.slice(-3000), candidates }) }
      ]
    });

    const raw = r.choices?.[0]?.message?.content || "";
    let data = {};
    try { data = JSON.parse(raw); }
    catch {
      const m = raw.match(/\{[\s\S]*\}$/);
      if (m) { try { data = JSON.parse(m[0]); } catch { data = {}; } }
    }

    if (!data || !Array.isArray(data.ids) || data.ids.length === 0) {
      return Response.json(safeFallback(snippets));
    }

    const coverage = data.coverage && typeof data.coverage === "object"
      ? { cap: !!data.coverage.cap, collab: !!data.coverage.collab, cond: !!data.coverage.cond }
      : { cap: false, collab: false, cond: false };

    return Response.json({
      ids: data.ids.slice(0, 3),
      rationales: Array.isArray(data.rationales) ? data.rationales.slice(0, 3) : [],
      coverage
    });
  } catch {
    return Response.json(safeFallback(snippets));
  }
}
