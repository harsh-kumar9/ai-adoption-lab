// src/components/RightRail.js
"use client";
import Card from "./Card";
import SourceIcon from "./SourceIcon";

const friendlyName = {
  "Team Wiki": "Team Wiki",
  "Pulse Survey": "Pulse Survey",
  "Code Insights": "Code Insights",
  "Meetings & Handoffs": "Meetings & Handoffs",
  "Policy & Training": "Policy & Training",
  "Customer/QA": "Customer/QA",
  "External Benchmark": "External Benchmark",
};

export default function RightRail({ variant, snippets, profile, usedIds = [], onCardClick }) {
  const title = variant === "proto" ? "Context (auto-used if relevant)" : "Reference Cards";

  return (
    <div className="space-y-3">
      {variant === "proto" && profile && (
        <Card>
          <div className="kicker">Personalization</div>
          <div className="text-sm">
            Numeracy <span className="font-medium">{profile?.numeracy}</span> · Scope{" "}
            <span className="font-medium">{prettyLevel(profile?.org_level)}</span> · Span{" "}
            <span className="font-medium">{prettySpan(profile?.span_bucket)}</span>
          </div>
        </Card>
      )}

      <Card>
        <div className="kicker mb-2">{title}</div>
        <div className="space-y-2">
          {snippets.map((s) => {
            const used = usedIds.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onCardClick?.(s)}
                className={`w-full text-left flex items-start gap-3 rounded-xl border px-3 py-2 transition-colors ${
                  used ? "border-indigo-400 bg-indigo-50" : "hover:bg-black/5"
                }`}
              >
                <div className="mt-0.5 text-slate-600"><SourceIcon type={friendlyName[s.source] || s.source} /></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {friendlyName[s.source] || s.source} <span className="text-slate-400">·</span>{" "}
                    <span className="font-mono text-[12px] text-slate-500">{s.id}</span>
                  </div>
                  <div className="text-[13px] text-slate-700">{s.title}</div>
                  <div className="text-[12px] text-slate-500 mt-0.5">{s.blurb}</div>
                </div>
                {used && <span className="text-[11px] text-indigo-700">used</span>}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* helpers */
function prettyLevel(id){ return { ic:"IC", manager:"Manager", director:"Director/Head", vp:"VP/C-suite" }[id] || "Manager"; }
function prettySpan(id){ return { "0":"0","1":"1","2_5":"2–5","6_10":"6–10","11_20":"11–20","21_50":"21–50","51_plus":"51+" }[id] || "2–5"; }
