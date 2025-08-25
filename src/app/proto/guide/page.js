"use client";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import { Button } from "@/components/Button";

export default function ProtoGuide() {
  const router = useRouter();

  return (
    <div className="max-w-6xl space-y-4">
      <Card className="p-5 sm:p-6">
        {/* Header */}
        <div className="mb-3">
          <div className="kicker">Sensemaking Guide</div>
          <h1 className="text-xl sm:text-2xl font-extrabold mt-1">
            The 3Cs of AI Adoption: Capability, Collaboration, and Conditions
          </h1>
          <p className="text-[13.5px] sm:text-sm text-slate-700 mt-1">
            A simple lens for leaders: start with the individual, then the workflow, then the environment—so you don’t miss what really matters.
          </p>
        </div>

        {/* Body: two columns */}
        <div className="flex flex-wrap gap-4 md:gap-6 items-stretch">
          {/* LEFT COLUMN */}
          <div className="flex-[1.25_1_520px] min-w-[340px]">
            <p className="text-[14px] mt-2">
              Focusing only on broad outcomes (revenue, velocity) can hide what’s happening to people and teams—and cause you to miss good ideas. When you assess AI adoption, walk layer by layer:
            </p>

            {/* Capability */}
            <Section
              title={<>1) Start with <em>Capability</em> (the individual)</>}
              top
            >
              <p className="text-[14px] mt-1">
                You should start by thinking about the impact on the employee—their ability to do the work, their thinking effort, and their growth.
              </p>
              <ul className="list-disc ml-5 mt-2 space-y-1 text-[14px]">
                <li>
                  <strong>Look for common measures:</strong> Are people becoming too dependent on AI? Can they still perform key tasks
                  without it? How much time is actually saved on common tasks? Is quality better or is rework rising? Do people have
                  enough focus time? How are confidence and stress changing (simple pulse checks)?
                </li>
                <li>
                  <strong>When you think about questions:</strong> What changed, for whom, and on which tasks? Where do mistakes or
                  do-overs appear? What would count as a real improvement in 30 days?
                </li>
              </ul>
            </Section>

            {/* Collaboration */}
            <Section title={<>2) Then check <em>Collaboration</em> (the workflow)</>}>
              <p className="text-[14px] mt-1">
                Then move to the relationships and the flow of work—how people work with each other and with AI.
              </p>
              <ul className="list-disc ml-5 mt-2 space-y-1 text-[14px]">
                <li>
                  <strong>Look for common measures:</strong> How has meeting time changed? Are handoffs smoother or messier? Are people
                  double-checking AI’s work or rubber-stamping it? Is decision time faster or stuck? Are notes/docs kept up to date?
                  Is know-how spreading or concentrated in a few hands?
                </li>
                <li>
                  <strong>When you think about questions:</strong> Which steps sped up or slowed down? Where does work pile up? Which
                  reviews catch issues and which don’t?
                </li>
              </ul>
            </Section>

            {/* Conditions */}
            <Section title={<>3) Finally, review <em>Conditions</em> (the environment)</>}>
              <p className="text-[14px] mt-1">
                Think about the culture, incentives, rules, and access that shape AI use.
              </p>
              <ul className="list-disc ml-5 mt-2 space-y-1 text-[14px]">
                <li>
                  <strong>Look for common measures:</strong> Is there a clear, simple policy—and do people know it? Does everyone who
                  needs AI have the right tools and data? Do incentives push speed over safety or learning? Is it safe to raise
                  concerns? Are you learning from small experiments and incidents?
                </li>
                <li>
                  <strong>When you think about questions:</strong> What norms or rules get in the way? Who is left out of access? What one
                  change would remove the most friction or risk?
                </li>
              </ul>
            </Section>

            {/* Actions box */}
            <div className="mt-3 rounded-lg border p-3 sm:p-4 bg-slate-50">
              <div className="text-[14px] font-semibold">When you think about actions:</div>
              <ul className="list-disc ml-5 mt-2 space-y-1 text-[14px]">
                <li>Pick 1–2 small, reversible steps. Assign an owner and a 30-day check.</li>
                <li>Check cross-layer effects: a fix for Capability can help or hurt Collaboration; tune Conditions to balance.</li>
                <li>
                  Close the loop: <em>observe → ask → act → review</em>. Keep what works; adjust what doesn’t.
                </li>
              </ul>
              <div className="text-[12px] text-slate-500 mt-2">
                Memory hook: <strong>3Cs = Capability, Collaboration, Conditions</strong>. Check all three before deciding.
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (FIGURE) */}
          <div className="flex-[1_1_520px] min-w-[340px]">
            <div className="rounded-xl border p-4 sm:p-5 bg-slate-50">
              <div className="text-[14px] font-extrabold text-slate-900">Figure 1. The 3Cs Model</div>
              <div className="text-[12.5px] text-slate-700 mb-3">
                Start with the individual, then the workflow, then the environment → align and iterate toward business outcomes.
              </div>

              {/* SVG diagram */}
              <ThreeCsSVG />

              <div className="mt-2 text-[12.5px] text-slate-600">
                <em>Read inside-out:</em> <strong>Capability → Collaboration → Conditions.</strong> Align all three, and use outcome
                feedback to iteratively adjust each layer.
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => router.push("/proto")} className="px-4">
          Start the conversation
        </Button>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */
function Section({ title, children, top }) {
  return (
    <div className={`${top ? "mt-3" : "mt-4"} pt-3 border-t`}>
      <div className="text-[15px] font-extrabold mb-1">{title}</div>
      {children}
    </div>
  );
}

function ThreeCsSVG() {
  return (
    <svg className="w-full h-auto" viewBox="0 0 900 460" role="presentation" aria-label="3Cs concentric model">
      <defs>
        <marker id="arrowDark" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill="#6B7280"></path>
        </marker>
        <marker id="arrowLight" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill="#9CA3AF"></path>
        </marker>
      </defs>

      {/* Rings */}
      <g>
        <circle cx="380" cy="230" r="154" fill="none" stroke="#9CA3AF" strokeWidth="2.5" />
        <circle cx="380" cy="230" r="112" fill="none" stroke="#6B7280" strokeWidth="2.5" />
        <circle cx="380" cy="230" r="70"  fill="none" stroke="#374151" strokeWidth="2.5" />
        <text x="380" y="226" textAnchor="middle" fontWeight="800" fontSize="14" fill="#111827">Capability</text>
        <text x="380" y="244" textAnchor="middle" fontSize="12" fill="#4B5563">Individual</text>
        <text x="380" y="140" textAnchor="middle" fontWeight="800" fontSize="14" fill="#111827">Collaboration</text>
        <text x="380" y="158" textAnchor="middle" fontSize="12" fill="#4B5563">Workflow</text>
        <text x="380" y="88"  textAnchor="middle" fontWeight="800" fontSize="14" fill="#111827">Conditions</text>
        <text x="380" y="106" textAnchor="middle" fontSize="12" fill="#4B5563">Environment</text>
      </g>

      {/* Arrow from rings to outcomes */}
      <g stroke="#6B7280" strokeWidth="2.6" fill="none">
        <line x1="534" y1="230" x2="700" y2="230" markerEnd="url(#arrowDark)" />
      </g>

      {/* Outcomes box */}
      <g>
        <rect x="710" y="150" width="190" height="170" rx="12" ry="12" fill="#F9FAFB" stroke="#E5E7EB"></rect>
        <text x="805" y="175" textAnchor="middle" fontWeight="800" fontSize="13.5" fill="#111827">Business Outcomes</text>
        <text x="724" y="198" fontSize="12.5" fill="#1F2937">• ROI / cost-to-serve</text>
        <text x="724" y="216" fontSize="12.5" fill="#1F2937">• Revenue lift</text>
        <text x="724" y="234" fontSize="12.5" fill="#1F2937">• Cycle time / throughput</text>
        <text x="724" y="252" fontSize="12.5" fill="#1F2937">• Defect rate / quality</text>
        <text x="724" y="270" fontSize="12.5" fill="#1F2937">• Customer sat / retention</text>
      </g>

      {/* Feedback arrow */}
      <path
        d="M710,320 C600,370 460,380 226,230"
        fill="none"
        stroke="#9CA3AF"
        strokeWidth="1.8"
        markerEnd="url(#arrowLight)"
      />
      <text x="520" y="364" textAnchor="middle" fontSize="11.5" fill="#4B5563">
        Outcomes → refine policies, workflow, and training (feedback)
      </text>
    </svg>
  );
}
