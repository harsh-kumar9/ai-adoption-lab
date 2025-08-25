"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

export default function CoachPopover({
  open,
  anchorRef,           // ref to the input wrapper
  bullets = [],        // array of strings
  rewrite = "",        // single sentence
  onApply,             // (rewrite) => void
  onClose,
}) {
  const popRef = useRef(null);
  const [style, setStyle] = useState({ top: 0, left: 0, width: 560, placement: "bottom" });

  const position = () => {
    if (!anchorRef?.current) return;
    const a = anchorRef.current.getBoundingClientRect();
    const margin = 8;
    const vw = window.innerWidth;
    const maxW = 720;
    const minW = 420;
    const width = clamp(a.width, minW, maxW);
    const left = clamp(a.left + a.width / 2 - width / 2, 16, vw - width - 16);

    const approxH = popRef.current?.offsetHeight || 180;
    const roomBelow = window.innerHeight - a.bottom;
    const placement = roomBelow > approxH + 16 ? "bottom" : "top";
    const top = placement === "bottom" ? Math.round(a.bottom + margin) : Math.round(a.top - approxH - margin);
    setStyle({ top, left, width, placement });
  };

  useLayoutEffect(() => { if (open) position(); }, [open]); // eslint-disable-line
  useEffect(() => {
    if (!open) return;
    const onScroll = () => position();
    const onResize = () => position();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize); };
  }, [open]); // eslint-disable-line

  if (!open) return null;

  const body = (
    <div
      ref={popRef}
      style={{ top: style.top, left: style.left, width: style.width }}
      className="fixed z-[60] rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5"
    >
      {/* arrow */}
      <div
        className={`absolute ${style.placement === "bottom" ? "-top-2" : "-bottom-2"} left-10 h-4 w-4 rotate-45 rounded-sm bg-white border border-slate-200`}
        aria-hidden
      />
      <div className="p-4">
        <div className="text-[13px] font-semibold text-slate-700 mb-2">To round it out, you could try:</div>

        {/* Feedback bullets */}
        {bullets?.length > 0 && (
          <ul className="mb-3 list-disc pl-5 text-[13px] text-slate-700 space-y-1">
            {bullets.slice(0, 3).map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        )}

        {/* Rewrite box */}
        <div className="rounded-md border border-indigo-300 bg-indigo-50/50 p-2">
          <div className="text-[12px] font-medium text-indigo-800 mb-1">Try this rewrite</div>
          <div className="text-[14px] leading-snug text-slate-900">{rewrite || "—"}</div>
        </div>

        <div className="mt-3 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-[13px] rounded-md border border-slate-200 hover:bg-slate-50"
          >
            Dismiss
          </button>
          <button
            onClick={() => onApply?.(rewrite)}
            className="px-3 py-1.5 text-[13px] rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Apply rewrite
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(body, document.body);
}
