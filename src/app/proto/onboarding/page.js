"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import { Button } from "@/components/Button";

const ORG_LEVELS = [
  { id: "ic", label: "IC" },
  { id: "manager", label: "Manager" },
  { id: "director", label: "Director/Head" },
  { id: "vp", label: "VP/C-suite" },
];

const SPAN_BUCKETS = [
  { id: "0", label: "0" },
  { id: "1", label: "1" },
  { id: "2_5", label: "2–5" },
  { id: "6_10", label: "6–10" },
  { id: "11_20", label: "11–20" },
  { id: "21_50", label: "21–50" },
  { id: "51_plus", label: "51+" },
];

const personaSpan = (orgLevel) =>
  ({ ic: "individual", manager: "team", director: "org", vp: "policy" }[orgLevel] || "team");

export default function ProtoOnboarding() {
  const router = useRouter();

  // Q1/Q2: 1–4 scale (no neutral)
  const [chart, setChart] = useState(2);
  const [calc, setCalc] = useState(2);

  // Q3/Q4
  const [level, setLevel] = useState("manager");
  const [spanBucket, setSpanBucket] = useState("2_5");

  function saveAndNext() {
    const numeracy = Number(((chart + calc) / 2).toFixed(1)); // 1.0–4.0
    const profile = {
      numeracy,
      chart_literacy: chart,
      calc_comfort: calc,
      org_level: level,
      span_bucket: spanBucket,
      // for LLM persona:
      span: personaSpan(level),
    };
    localStorage.setItem("protoProfile", JSON.stringify(profile));
    router.push("/proto/guide");
  }

  return (
    <div className="max-w-4xl">
      <Card className="p-5 sm:p-6">
        <h2 className="text-xl font-extrabold mb-3">Quick setup</h2>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Q1 */}
          <div>
            <div className="font-medium">Numeracy</div>
            <div className="text-sm" style={{ color: "var(--muted)" }}>
              When you see a simple chart or small table, how comfortable are you extracting the key takeaway and
              checking if the numbers make sense?
            </div>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="4"
                step="1"
                value={chart}
                onChange={(e) => setChart(+e.target.value)}
                className="w-full"
              />
              <span className="text-sm">{chart}</span>
            </div>
            <div className="mt-1 text-[12px]" style={{ color: "var(--muted)" }}>
              1 Not at all · 2 A bit · 3 Comfortable · 4 Very comfortable
            </div>
          </div>

          {/* Q2 */}
          <div>
            <div className="font-medium">Back-of-the-envelope</div>
            <div className="text-sm" style={{ color: "var(--muted)" }}>
              How comfortable are you doing quick percent/ratio/ROI calculations in your head or on a notepad?
            </div>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="4"
                step="1"
                value={calc}
                onChange={(e) => setCalc(+e.target.value)}
                className="w-full"
              />
              <span className="text-sm">{calc}</span>
            </div>
            <div className="mt-1 text-[12px]" style={{ color: "var(--muted)" }}>
              1 Not at all · 2 A bit · 3 Comfortable · 4 Very comfortable
            </div>
          </div>

          {/* Q3 */}
          <div>
            <div className="font-medium">Scope of decision-making</div>
            <div className="text-sm" style={{ color: "var(--muted)" }}>
              Which best describes your current scope?
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {ORG_LEVELS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setLevel(o.id)}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                    level === o.id ? "bg-indigo-600 text-white border-indigo-600" : "hover:bg-black/5"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Q4 */}
          <div>
            <div className="font-medium">Span of control (headcount)</div>
            <div className="text-sm" style={{ color: "var(--muted)" }}>
              Roughly how many people are in your span (direct + dotted-line)?
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {SPAN_BUCKETS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSpanBucket(b.id)}
                  className={`px-2.5 py-1.5 rounded-lg border text-sm transition-colors ${
                    spanBucket === b.id ? "bg-indigo-50 border-indigo-300 text-indigo-800" : "hover:bg-black/5"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <div className="text-sm" style={{ color: "var(--muted)" }}>
            Numeracy avg: <span className="font-medium">{((chart + calc) / 2).toFixed(1)}</span>
          </div>
          <Button onClick={saveAndNext}>Continue</Button>
        </div>
      </Card>
    </div>
  );
}
