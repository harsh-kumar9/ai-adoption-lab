// src/app/proto/guide/page.js
"use client";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import { Button } from "@/components/Button";

export default function ProtoGuide() {
  const router = useRouter();

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center gap-6">
      <Card className="w-full max-w-4xl p-5 sm:p-6">
        <ThreeCsSVG />
      </Card>

      <Button onClick={() => router.push("/proto")} className="px-4">
        Start the conversation
      </Button>
    </div>
  );
}

function ThreeCsSVG() {
  return (
    <svg className="w-full h-auto" viewBox="0 0 900 460" role="img" aria-label="3Cs concentric model">
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
