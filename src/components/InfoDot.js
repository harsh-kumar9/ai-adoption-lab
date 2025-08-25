"use client";
import { useId } from "react";

export default function InfoDot({ label, active, definition, question, className = "" }) {
  const tid = useId();
  return (
    <div
      className={`relative inline-flex items-center gap-1 group ${className}`}
      tabIndex={0}
      aria-describedby={tid}
      role="button"
    >
      <span
        aria-hidden
        className={`h-2.5 w-2.5 rounded-full ${active ? "bg-green-500" : "bg-slate-400/40"}`}
      />
      <span className="text-xs text-slate-600">{label}</span>

      {/* Tooltip */}
      <div
        id={tid}
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-50 hidden w-80 -translate-x-1/2 rounded-md border border-slate-200 bg-white p-3 text-[12px] text-slate-800 shadow-lg ring-1 ring-black/5 group-hover:block group-focus:block mt-2"
      >
        <div className="font-semibold mb-1">{label}</div>
        <p className="mb-1">{definition}</p>
        <p className="text-[11px] text-slate-600"><span className="font-medium">Ask:</span> {question}</p>
        {/* little arrow */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-4 w-4 rotate-45 rounded-sm bg-white border border-slate-200" aria-hidden />
      </div>
    </div>
  );
}
