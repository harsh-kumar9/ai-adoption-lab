// src/app/proto/setup/page.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import { Button } from "@/components/Button";

/* Map 1–5 Likert + BNT correctness into 1–4 numeracy bands for the model */
function deriveNumeracy(avgLikert, bntCorrect) {
  const adjusted = Math.max(1, Math.min(5, avgLikert + (bntCorrect ? 0.25 : -0.25)));
  if (adjusted >= 4.2) return 4;
  if (adjusted >= 3.4) return 3;
  if (adjusted >= 2.6) return 2;
  return 1;
}

export default function ProtoSetup() {
  const router = useRouter();

  // --- SNS-like items (1–5)
  const [sns1, setSns1] = useState(3); // preference for numbers
  const [sns2, setSns2] = useState(3); // self-rated ability with %/ratios
  const [sns3, setSns3] = useState(3); // comfort interpreting charts/tables

  // --- BNT-like micro-item
  // Q: “Out of 1,000 users, 10 churned last week. What percentage is that?”
  const [bntChoice, setBntChoice] = useState(""); // "0.1%", "1%", "10%"
  const bntCorrect = bntChoice === "1%";

  // --- org placement
  const [orgLevel, setOrgLevel] = useState("manager"); // ic | manager | director | vp
  const [spanBucket, setSpanBucket] = useState("2_5");  // 0,1,2_5,6_10,11_20,21_50,51_plus

  const likert = [1, 2, 3, 4, 5];

  function continueNext() {
    const avgLikert = (sns1 + sns2 + sns3) / 3.0;
    const numeracy = deriveNumeracy(avgLikert, bntCorrect);

    const span =
      orgLevel === "vp" ? "policy" :
      orgLevel === "director" ? "org" :
      orgLevel === "ic" ? "individual" : "team";

    const profile = {
      numeracy,                     // 1–4 for model prompts
      org_level: orgLevel,
      span_bucket: spanBucket,
      span,
      // store raw responses for analysis
      sns: { sns1, sns2, sns3, avgLikert },
      bnt: { item: "10/1000 as percent", choice: bntChoice, correct: bntCorrect }
    };

    localStorage.setItem("protoProfile", JSON.stringify(profile));
    router.push("/proto/guide");
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Card>
        <div className="text-2xl font-bold mb-6">Quick setup</div>

        {/* LEFT: SNS/BNT block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="font-semibold mb-2">How you work with numbers</div>
            <div className="text-sm text-slate-600 mb-3">
              Adapted for managers from the <em>Subjective Numeracy Scale</em> and the <em>Berlin Numeracy Test</em>.
              Please answer quickly; there are no right or wrong preferences.
            </div>

            {/* SNS1 */}
            <div className="mb-4">
              <div className="mb-1">
                I prefer information with <strong>numbers</strong> (percentages or frequencies) rather than words alone.
              </div>
              <div className="flex gap-3 items-center">
                {likert.map(v => (
                  <label key={`sns1-${v}`} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="sns1"
                      value={v}
                      checked={sns1 === v}
                      onChange={() => setSns1(v)}
                    />
                    <span className="text-sm">{v}</span>
                  </label>
                ))}
                <span className="text-xs text-slate-500 ml-1">1 = strongly disagree · 5 = strongly agree</span>
              </div>
            </div>

            {/* SNS2 */}
            <div className="mb-4">
              <div className="mb-1">
                Working with <strong>percentages/ratios</strong> is easy for me.
              </div>
              <div className="flex gap-3 items-center">
                {likert.map(v => (
                  <label key={`sns2-${v}`} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="sns2"
                      value={v}
                      checked={sns2 === v}
                      onChange={() => setSns2(v)}
                    />
                    <span className="text-sm">{v}</span>
                  </label>
                ))}
                <span className="text-xs text-slate-500 ml-1">1 = strongly disagree · 5 = strongly agree</span>
              </div>
            </div>

            {/* SNS3 */}
            <div className="mb-4">
              <div className="mb-1">
                When I look at a <strong>chart or table</strong>, I can quickly tell what it implies for my team.
              </div>
              <div className="flex gap-3 items-center">
                {likert.map(v => (
                  <label key={`sns3-${v}`} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="sns3"
                      value={v}
                      checked={sns3 === v}
                      onChange={() => setSns3(v)}
                    />
                    <span className="text-sm">{v}</span>
                  </label>
                ))}
                <span className="text-xs text-slate-500 ml-1">1 = strongly disagree · 5 = strongly agree</span>
              </div>
            </div>

            {/* BNT micro-item */}
            <div className="mb-6">
              <div className="mb-1">
                <strong>Quick check:</strong> Out of 1,000 users, 10 churned last week. What <em>percentage</em> is that?
              </div>
              <div className="space-y-2">
                {["0.1%", "1%", "10%"].map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bnt"
                      value={opt}
                      checked={bntChoice === opt}
                      onChange={(e) => setBntChoice(e.target.value)}
                    />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: org placement */}
          <div>
            <div className="font-semibold mb-2">Where you sit</div>

            <div className="mb-5">
              <div className="mb-1">Scope / level</div>
              <select
                className="w-full rounded-lg border px-3 py-2"
                value={orgLevel}
                onChange={(e) => setOrgLevel(e.target.value)}
              >
                <option value="ic">IC</option>
                <option value="manager">Manager</option>
                <option value="director">Director/Head</option>
                <option value="vp">VP/C-suite</option>
              </select>
              <div className="text-sm text-slate-600 mt-2">
                Determines whether answers target the individual, team, org, or policy layer.
              </div>
            </div>

            <div className="mb-5">
              <div className="mb-1">Span of control (direct reports)</div>
              <select
                className="w-full rounded-lg border px-3 py-2"
                value={spanBucket}
                onChange={(e) => setSpanBucket(e.target.value)}
              >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2_5">2–5</option>
                <option value="6_10">6–10</option>
                <option value="11_20">11–20</option>
                <option value="21_50">21–50</option>
                <option value="51_plus">51+</option>
              </select>
              <div className="text-sm text-slate-600 mt-2">
                Used to tune examples and defaults to your span.
              </div>
            </div>

            <div className="rounded-md border bg-slate-50 p-3 text-xs text-slate-600">
              <strong>Note:</strong> These brief items adapt constructs from the Subjective Numeracy Scale
              and Berlin Numeracy Test to a workplace context.
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={continueNext}
            disabled={!bntChoice} // require a selection for the quick check
          >
            Continue
          </Button>
        </div>
      </Card>
    </div>
  );
}
