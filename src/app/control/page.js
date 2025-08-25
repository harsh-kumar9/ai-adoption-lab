// src/app/control/page.js
"use client";
import { useState } from "react";
import Card from "@/components/Card";
import ChatPanel from "@/components/ChatPanel";
import RightRail from "@/components/RightRail";
import { Button } from "@/components/Button";
import Modal from "@/components/Modal";
import { SNIPPETS } from "@/data/snippets";

function PreviewBody({ s }) {
  if (!s) return null;

  switch (s.source) {
    case "Pulse Survey":
      return (
        <>
          <p>
            <strong>Method.</strong> Monthly three-item pulse sent to all ICs and managers. Typical response rate 62–75% (N≈100–140).
            Items track: (1) uninterrupted focus time, (2) confidence using GenAI on core tasks, (3) perceived stress.
          </p>
          <p>
            <strong>Recent pattern (last 30 days).</strong> Focus time increased modestly while stress declined. Confidence rose among ICs
            but was flat among managers. Team-level variance suggests uneven enablement.
          </p>
          <ul className="list-disc ml-5">
            <li>Focus time: <em>+12%</em> vs prior 30d (ICs; managers +4%).</li>
            <li>Confidence using GenAI: <em>+9pp</em> (ICs); managers <em>+1pp</em>.</li>
            <li>Self-reported stress: <em>−5pp</em> overall; larger drops where training completion is high.</li>
          </ul>
          <p className="text-slate-600">Notes: Items use 5-point Likert; team cuts available on request.</p>
        </>
      );

    case "Team Wiki":
      return (
        <>
          <p>
            <strong>Source.</strong> Curated issues and Q&A from team channels and office hours. Items are tagged by org, region, and
            severity; duplicates merged weekly.
          </p>
          <p><strong>Top themes this month.</strong></p>
          <ul className="list-disc ml-5">
            <li><em>Access friction (23%).</em> Tool license mismatches; slow approvals for new seats.</li>
            <li><em>Policy uncertainty (14%).</em> Confusion about allowed data types and retention.</li>
            <li><em>Data quality (12%).</em> Hallucinations in niche domains; lack of canonical examples.</li>
          </ul>
          <p className="text-slate-600">See also: mitigation proposals and open owners on the wiki page.</p>
        </>
      );

    case "Code Insights":
      return (
        <>
          <p>
            <strong>Scope.</strong> Repo hooks aggregate per-PR metrics: review latency, author AI-assist flag, CI failure rate, and merge
            velocity. Breakdowns by repo/team.
          </p>
          <ul className="list-disc ml-5">
            <li>Review latency: <em>−18%</em> vs prior 30d (n≈640 PRs), driven by shorter first-response time.</li>
            <li>AI-assisted authorship: <em>+18%</em> of PRs include AI-suggested diffs; higher in platform repos.</li>
            <li>CI failures: <em>−3pp</em> overall; improves where test coverage was already ≥70%.</li>
          </ul>
          <p className="text-slate-600">Outliers and repo-level trends available via the engineering dashboard.</p>
        </>
      );

    case "Meetings & Handoffs":
      return (
        <>
          <p>
            <strong>What’s tracked.</strong> Calendar hours per person, frequency of multi-party handoffs, re-open/retry events, and
            document freshness (days since last update) on shared specs/notes.
          </p>
          <ul className="list-disc ml-5">
            <li>Meeting load: <em>−1.2 h/person/week</em> vs prior 30d; fewer status updates, more async notes.</li>
            <li>Handoff retries: <em>+3pp</em> after AI introduction in two teams; likely due to unclear review gates.</li>
            <li>Doc freshness: <em>+9pp</em> documents updated within two weeks of a change.</li>
          </ul>
          <p className="text-slate-600">Workflow diagrams available; handoff definitions vary by team.</p>
        </>
      );

    case "Policy & Training":
      return (
        <>
          <p>
            <strong>Policy cadence.</strong> GenAI policy <em>v2.3</em> rolled out six weeks ago with simplified guidance on data handling
            and review. Access requests now auto-expire after 90 days without activity.
          </p>
          <ul className="list-disc ml-5">
            <li>Training completion: <em>76%</em> overall (IC 81%, Manager 68%); targeted refreshers planned.</li>
            <li>Exceptions: small number of policy exceptions under legal review.</li>
          </ul>
          <p className="text-slate-600">See the policy page for change log and FAQ.</p>
        </>
      );

    case "Customer/QA":
      return (
        <>
          <p>
            <strong>Quality signals.</strong> Post-release defects, escalation volume, and rework hours attributed to QA or field reports.
            Links to release cadence and owner teams.
          </p>
          <ul className="list-disc ml-5">
            <li>Defect rate: <em>−11%</em> vs prior 30d; concentrated improvements in two product lines.</li>
            <li>Escalations: <em>−6%</em> overall; unchanged for enterprise customers.</li>
            <li>Rework hours: <em>−8%</em>; largest gains where AI is used for test-case generation.</li>
          </ul>
          <p className="text-slate-600">Severity thresholds consistent with the QA handbook.</p>
        </>
      );

    case "External Benchmark":
      return (
        <>
          <p>
            <strong>Industry report.</strong> Cross-firm analysis of GenAI adoption and quality results among comparable companies (last 90
            days). Data includes active use rates, QA pass deltas, and rollout practices.
          </p>
          <ul className="list-disc ml-5">
            <li>Active use among peers: <em>34–52%</em> weekly; sustained cohorts correlate with clear enablement.</li>
            <li>QA pass rates: <em>+5–12pp</em> post-AI where human review remains mandatory for high-risk tasks.</li>
            <li>Rollout patterns: pilots → policy update → training waves → targeted automation.</li>
          </ul>
          <p className="text-slate-600">Report excerpts available on request; vendor anonymized data.</p>
        </>
      );

    case "Research Findings":
      return (
        <>
          <p>
            <strong>Academic synthesis.</strong> Peer-reviewed studies on AI-in-the-loop show heterogeneous productivity gains, error
            redistribution, and the importance of oversight and training. Effects vary by task complexity and experience level.
          </p>
          <ul className="list-disc ml-5">
            <li>Productivity lifts for routine drafting and coding; risk of over-reliance on hard problems.</li>
            <li>Quality improves with structured review and checklists; declines when oversight is skipped.</li>
            <li>Training that teaches “when not to use AI” reduces critical errors and speeds escalation.</li>
          </ul>
          <p className="text-slate-600">Includes summaries of recent RCTs and field deployments; citations on file.</p>
        </>
      );

    default:
      return <p>Representative preview…</p>;
  }
}

export default function ControlChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSnippet, setModalSnippet] = useState(null);

  async function send() {
    if (!input.trim()) return;
    const next = [...messages, { role: "user", content: input }];
    setMessages(next);
    setInput("");

    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "control", messages: next })
    });
    const { text } = await r.json();
    setMessages([...next, { role: "assistant", content: text }]);
  }

  // Good starter questions by topic (one will be sampled each visit)
    const SUGGESTIONS = [
    {
        topic: "Adoption & Usage Patterns",
        text: "Within my team, what share of people used AI at least weekly in the last 30 days, by role?",
    },
    {
        topic: "Enablement & Skill-Building",
        text: "Where do AI-assisted drafts most often need rework, and what training would reduce it?",
    },
    {
        topic: "Business Impact & ROI",
        text: "Across our top three tasks, how much time did GenAI save vs rework last quarter, and what’s the estimated ROI?",
    },
    ];

        // Pick one suggestion once (doesn't change on re-renders)
    const [suggestion] = useState(
    () => SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)]
    );


  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-8 space-y-3">
        <Card>
          <div className="text-sm mt-1 text-slate-600">
                    Hi — try asking
                    <span className="ml-1 rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-900">
                        {suggestion.text}
                    </span>
                    </div>
          <ChatPanel messages={messages} />
          <div className="mt-3 flex gap-2">
            <input
              className="flex-1 rounded-lg border px-3 py-2 focus-ring"
              placeholder="Ask or reflect…"
              value={input}
              onChange={(e)=>setInput(e.target.value)}
              onKeyDown={(e)=>e.key==='Enter'&&!e.shiftKey&&send()}
            />
            <Button onClick={send}>Send</Button>
          </div>
        </Card>
      </div>

      <div className="col-span-4">
        <RightRail
          variant="control"
          snippets={SNIPPETS}
          usedIds={[]} // Control does not auto-use sources
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
