// src/app/proto/page.js
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import ChatPanel from "@/components/ChatPanel";
import RightRail from "@/components/RightRail";
import { Button } from "@/components/Button";
import CoachPopover from "@/components/CoachPopover";
import Modal from "@/components/Modal";
import { SNIPPETS } from "@/data/snippets";
import InfoDot from "@/components/InfoDot";

/* ---------- helpers ---------- */
function prettyLevel(id){ return { ic:"IC", manager:"Manager", director:"Director/Head", vp:"VP/C-suite" }[id] || "Manager"; }
function prettySpan(id){ return { "0":"0","1":"1","2_5":"2–5","6_10":"6–10","11_20":"11–20","21_50":"21–50","51_plus":"51+" }[id] || "2–5"; }
const lastTurns = (msgs, n=6) => msgs.slice(-n).map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");

/* Reuse the enriched preview body from Control (inline here for convenience) */
function PreviewBody({ s }) {
  if (!s) return null;
  const pick = (src) => ({
    "Pulse Survey": (
      <>
        <p><strong>Method.</strong> Monthly three-item pulse (N≈100–140). Tracks focus time, confidence using AI, and stress.</p>
        <ul className="list-disc ml-5">
          <li>Focus time up modestly; stress down; manager confidence lags ICs.</li>
          <li>Team variance suggests uneven enablement.</li>
        </ul>
        <p className="text-slate-600">Team cuts available; Likert 5-point items.</p>
      </>
    ),
    "Team Wiki": (
      <>
        <p><strong>Source.</strong> Curated adoption friction & complaints, tagged by org/region/severity; merged weekly.</p>
        <ul className="list-disc ml-5">
          <li>Access friction; policy uncertainty; niche data quality issues recur.</li>
        </ul>
        <p className="text-slate-600">Mitigation owners tracked on the page.</p>
      </>
    ),
    "Code Insights": (
      <>
        <p><strong>Scope.</strong> PR review latency, AI-assist mix, CI failures; repo/team breakdowns.</p>
        <ul className="list-disc ml-5">
          <li>Review latency down; first-response time improved.</li>
          <li>AI-assist rising; CI failures slightly down where tests strong.</li>
        </ul>
        <p className="text-slate-600">See engineering dashboard for outliers.</p>
      </>
    ),
    "Meetings & Handoffs": (
      <>
        <p><strong>Tracked.</strong> Meeting hours/person, handoff retries, document freshness.</p>
        <ul className="list-disc ml-5">
          <li>Meeting load ↓; retries ↑ in a few teams; doc freshness ↑.</li>
        </ul>
        <p className="text-slate-600">Workflow diagrams available.</p>
      </>
    ),
    "Policy & Training": (
      <>
        <p><strong>Cadence.</strong> Policy v2.3 rolled out; guidance simplified; access auto-expires after inactivity.</p>
        <ul className="list-disc ml-5">
          <li>Training completion around mid-70s, lower in managers.</li>
        </ul>
        <p className="text-slate-600">See change log and FAQ.</p>
      </>
    ),
    "Customer/QA": (
      <>
        <p><strong>Quality.</strong> Defects, escalations, and rework hours linked to releases and owners.</p>
        <ul className="list-disc ml-5">
          <li>Defects trending down; escalations down except enterprise; rework down where AI tests used.</li>
        </ul>
        <p className="text-slate-600">Severity thresholds per handbook.</p>
      </>
    ),
    "External Benchmark": (
      <>
        <p><strong>Report.</strong> Peer adoption and QA deltas over last quarter.</p>
        <ul className="list-disc ml-5">
          <li>Active use 34–52%; QA pass +5–12pp with mandatory human review.</li>
        </ul>
        <p className="text-slate-600">Vendor anonymized data.</p>
      </>
    ),
    "Research Findings": (
      <>
        <p><strong>Academic synthesis.</strong> RCTs & field studies on AI-in-the-loop.</p>
        <ul className="list-disc ml-5">
          <li>Routine tasks: strong productivity lifts; hard tasks: risk of over-reliance.</li>
          <li>Quality rises with structured oversight and “when not to use AI” training.</li>
        </ul>
        <p className="text-slate-600">Citations on file.</p>
      </>
    )
  }[src] || <p>Preview…</p>);
  return pick(s.source);
}

export default function ProtoChat(){
  const router = useRouter();

  // require onboarding profile; if missing, send to /proto/onboarding
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("protoProfile");
      if (!raw) { router.replace("/proto/onboarding"); return; }
      setProfile(JSON.parse(raw));
    } catch { router.replace("/proto/onboarding"); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* chat state */
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [nudge, setNudge] = useState(null);

  /* auto-used sources + coverage */
  const [usedIds, setUsedIds] = useState([]);
  const [coverage, setCoverage] = useState({ cap:false, collab:false, cond:false });

  // passive detector (secondary) so dots light up even if picker fails
  const tagger = useMemo(()=>({
    cap: /\b(skill|learn|confidence|load|focus|quality|rework|fatigue|stress|time)\b/i,
    collab: /\b(hand-?off|coordination|review|cycle time|meeting|approval|doc|knowledge)\b/i,
    cond: /\b(policy|incentive|governance|training|access|equity|license)\b/i
  }),[]);
  useEffect(()=>{
    const text = messages.map(m=>m.content).join("\n");
    setCoverage(c=>({
      cap: c.cap || tagger.cap.test(text),
      collab: c.collab || tagger.collab.test(text),
      cond: c.cond || tagger.cond.test(text),
    }));
  }, [messages, tagger]);

  /* source preview modal (like Control) */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSnippet, setModalSnippet] = useState(null);

  /* anchor for coach popover */
  const inputAnchorRef = useRef(null);

  /* LLM helpers */
  async function autoPickSources(focus){
    const r = await fetch("/api/sources", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        focus,
        transcript: lastTurns(messages),
        profile: { numeracy: profile?.numeracy, span: profile?.span },
        snippets: SNIPPETS
      })
    });
    const { ids = [], coverage = null } = await r.json();
    setUsedIds(ids);
    if (coverage) setCoverage(coverage);
    return { ids, coverage };
  }

  async function synthesizeFacts(selectedIds, focus){
    if (!selectedIds?.length) return { window: null, facts: [] };
    const r = await fetch("/api/sourcefacts", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        focus,
        transcript: lastTurns(messages),
        profile: { numeracy: profile?.numeracy, span: profile?.span },
        selected: selectedIds,
        snippets: SNIPPETS
      })
    });
    const { window, facts } = await r.json();
    return { window, facts };
  }

  async function send(){
    if(!input.trim() || !profile) return;
    const next = [...messages, { role:"user", content: input }];
    setMessages(next);
    setInput("");
    setNudge(null);

    const { ids: attached, coverage } = await autoPickSources(input);
    const { window, facts } = await synthesizeFacts(attached, input);

    const r = await fetch("/api/chat", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        mode: "proto",
        messages: next,
        numeracy: profile.numeracy,
        span: profile.span,
        attached,
        snippets: SNIPPETS,
        coverage,
        facts,
        windowLabel: window
      })
    });
    const { text } = await r.json();
    setMessages([...next, { role:"assistant", content: text }]);
  }

  async function coachIt(){
    if(!input.trim() || !profile) return;
    try {
      const r = await fetch("/api/coach", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          // send both keys to be compatible with any server shape
          question: input,
          query: input,
          profile: { numeracy: profile.numeracy, span: profile.span, org_level: profile.org_level },
          transcript: lastTurns(messages),
        })
      });

      const raw = await r.text();

      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        const m = raw.match(/\{[\s\S]*\}$/m);
        if (m) data = JSON.parse(m[0]);
      }

      const bullets =
        (Array.isArray(data?.feedback) && data.feedback) ||
        (Array.isArray(data?.bullets) && data.bullets) ||
        (Array.isArray(data?.tips) && data.tips) ||
        [];

      const rewrite =
        (typeof data?.rewrite === "string" && data.rewrite) ||
        (typeof data?.suggestion === "string" && data.suggestion) ||
        (typeof data?.rephrase === "string" && data.rephrase) ||
        "";

      if (!bullets.length && !rewrite) {
        setNudge({
          bullets: [
            "[Capability] Name roles/tasks so results map to people.",
            "[Collaboration] Add a workflow checkpoint (e.g., review latency).",
            "[Conditions] Note any policy/access constraint that could drive the pattern.",
          ],
          rewrite:
            "Within my team (past 4 weeks), by role and task, how many AI-assisted drafts per week and how has review latency changed?",
        });
        return;
      }

      setNudge({ bullets, rewrite });
    } catch (err) {
      setNudge({
        bullets: [
          "Specify roles/tasks (Capability) to avoid generic answers.",
          "Include a measurable workflow outcome (Collaboration).",
        ],
        rewrite:
          "For my team this quarter, which roles use AI weekly for which tasks, and how has review latency or rework changed?",
      });
    }
  }

  if (!profile) return null; // will redirect

  const usedChips = usedIds
    .map(id => {
      const s = SNIPPETS.find(x=>x.id===id);
      return s ? { id, label: `${s.source} · ${s.title}` } : null;
    })
    .filter(Boolean);

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-8 space-y-3">
        <Card>
          <div className="flex items-center justify-between">
            <div>
                {/* <div className="text-sm text-slate-700">
                Personalized (numeracy {profile.numeracy}, scope {prettyLevel(profile.org_level)}, span {prettySpan(profile.span_bucket)}).
                </div> */}
                <div className="text-sm mt-1 text-slate-500">
                Think aloud and type whenever you like. Ask anything about AI adoption or usage.
                </div>
            </div>

            <div className="flex items-center gap-4" aria-label="3Cs coverage">
            <InfoDot
                label="Capability"
                active={coverage.cap}
                definition="Individual skills, cognitive load, confidence, quality, error/rework."
                question="What impacts is AI having on individuals (e.g., focus time, confidence, wellbeing, errors/rework)?"
            />
            <InfoDot
                label="Collaboration"
                active={coverage.collab}
                definition="Handoffs, coordination, review latency, cycle time, documentation/knowledge."
                question="How is AI affecting human–human collaboration and workflow (where do handoffs speed up or pile up)?"
            />
            <InfoDot
                label="Conditions"
                active={coverage.cond}
                definition="Policy, access, training, incentives, governance, equity."
                question="Which org rules or incentives shape AI use (who has access; what norms block or enable)?"
            />
            </div>
          </div>

          <ChatPanel messages={messages} />

          {usedChips.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {usedChips.map(c => (
                <span key={c.id} className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[12px] bg-indigo-50 border-indigo-200 text-indigo-900">
                  Used: {c.label}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 relative" ref={inputAnchorRef}>
            <CoachPopover
              open={!!nudge}
              anchorRef={inputAnchorRef}
              bullets={nudge?.bullets || []}
              rewrite={nudge?.rewrite || ""}
              onApply={(text)=>{ setInput(text); setNudge(null); }}
              onClose={()=>setNudge(null)}
            />
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border px-3 py-2 focus-ring"
                placeholder="Ask or reflect…"
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}
              />
              <Button variant="ghost" onClick={coachIt}>Coach my question</Button>
              <Button onClick={send}>Send</Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="col-span-4">
        <RightRail
          variant="proto"
          snippets={SNIPPETS}
          profile={profile}
          usedIds={usedIds}
          onCardClick={(s)=>{ setModalSnippet(s); setModalOpen(true); }}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={()=>setModalOpen(false)}
        title={modalSnippet ? `${modalSnippet.source}: ${modalSnippet.title}` : "Preview"}
      >
        <div className="prose prose-sm max-w-none">
          <PreviewBody s={modalSnippet} />
        </div>
        <div className="text-[12px] text-slate-500 mt-3">This is a representative preview for the study.</div>
      </Modal>
    </div>
  );
}
