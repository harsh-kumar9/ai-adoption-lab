"use client";

/**
 * SourceIcon
 * - Normalizes the `type` string so close variants map to the same icon.
 * - All icons are stroke-only and inherit color via `stroke-current`.
 * - Usage: <SourceIcon type={snippet.source} className="h-4 w-4" />
 */
export default function SourceIcon({ type = "", className = "h-4 w-4" }) {
  const c = "stroke-current";
  const common = { strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };

  const t = String(type).toLowerCase();

  // --- normalize to a key
  let key = "default";
  if (t.includes("pulse") || t.includes("survey")) key = "pulse";
  else if (t.includes("wiki")) key = "wiki";
  else if (t.includes("code") || t.includes("repo")) key = "code";
  else if (t.includes("meeting") || t.includes("handoff")) key = "meet";
  else if (t.includes("policy") || t.includes("training") || t.includes("library")) key = "policy";
  else if (t.includes("qa") || t.includes("quality") || t.includes("customer")) key = "qa";
  else if (t.includes("benchmark")) key = "benchmark";
  else if (t.includes("web")) key = "web";
  else if (t.includes("research") || t.includes("paper") || t.includes("findings")) key = "research";

  switch (key) {
    case "pulse": // clipboard + pulse line
      return (
        <svg className={className} viewBox="0 0 24 24" {...common}>
          <path className={c} strokeWidth="1.8" d="M9 4h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          <path className={c} strokeWidth="1.8" d="M9 8h6" />
          <path className={c} strokeWidth="1.8" d="M6 12h3l1.5-2.5L12 16l2-3 1 1h3" />
        </svg>
      );

    case "wiki": // book
      return (
        <svg className={className} viewBox="0 0 24 24" {...common}>
          <path className={c} strokeWidth="1.8" d="M4 6a2 2 0 0 1 2-2h11v16H6a2 2 0 0 1-2-2V6Z" />
          <path className={c} strokeWidth="1.8" d="M6 18c0-1.1.9-2 2-2h9" />
        </svg>
      );

    case "code": // angle brackets
      return (
        <svg className={className} viewBox="0 0 24 24" {...common}>
          <path className={c} strokeWidth="1.8" d="M8 6L3 12l5 6" />
          <path className={c} strokeWidth="1.8" d="M16 6l5 6-5 6" />
        </svg>
      );

    case "meet": // calendar + swap arrows
      return (
        <svg className={className} viewBox="0 0 24 24" {...common}>
          <rect className={c} strokeWidth="1.8" x="3" y="4" width="18" height="16" rx="2" />
          <path className={c} strokeWidth="1.8" d="M3 9h18" />
          <path className={c} strokeWidth="1.8" d="M9 14h4l-2-2m2 2-2 2" />
          <path className={c} strokeWidth="1.8" d="M15 17h-4l2 2m-2-2 2-2" />
        </svg>
      );

    case "policy": // shield-check
      return (
        <svg className={className} viewBox="0 0 24 24" {...common}>
          <path className={c} strokeWidth="1.8" d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3Z" />
          <path className={c} strokeWidth="1.8" d="m9.5 12.5 2 2 3.5-3.5" />
        </svg>
      );

    case "qa": // badge-check (quality/acceptance)
      return (
        <svg className={className} viewBox="0 0 24 24" {...common}>
          <path className={c} strokeWidth="1.8" d="M12 3l2.1 1.3 2.4-.3 1.3 2.1 2.1 1.3-.3 2.4L21 12l-1.3 2.1.3 2.4-2.1 1.3-1.3 2.1-2.4-.3L12 21l-2.1 1.3-2.4-.3-1.3-2.1-2.1-1.3.3-2.4L3 12l1.3-2.1-.3-2.4 2.1-1.3L7.4 4l2.4.3L12 3Z" />
          <path className={c} strokeWidth="1.8" d="m8.8 12.3 2.1 2.1 4.3-4.3" />
        </svg>
      );

    case "benchmark": // bars + tiny globe ring
      return (
        <svg className={className} viewBox="0 0 24 24" {...common}>
          <path className={c} strokeWidth="1.8" d="M4 18V8M10 18V6M16 18v-4" />
          <circle className={c} strokeWidth="1.8" cx="19" cy="7" r="3" />
          <path className={c} strokeWidth="1.8" d="M16 7h6M19 4c2 2.2 2 5.8 0 6M19 4c-2 2.2-2 5.8 0 6" />
        </svg>
      );

    case "web": // globe
      return (
        <svg className={className} viewBox="0 0 24 24" {...common}>
          <circle className={c} strokeWidth="1.8" cx="12" cy="12" r="9" />
          <path className={c} strokeWidth="1.8" d="M3 12h18M12 3c3 3.5 3 14 0 18M12 3c-3 3.5-3 14 0 18" />
        </svg>
      );

    case "research": // beaker / flask
      return (
        <svg className={className} viewBox="0 0 24 24" {...common}>
          <path className={c} strokeWidth="1.8" d="M9 3h6" />
          <path className={c} strokeWidth="1.8" d="M10 3v5l-5 9a3 3 0 0 0 3 4h8a3 3 0 0 0 3-4l-5-9V3" />
        </svg>
      );

    default: // document
      return (
        <svg className={className} viewBox="0 0 24 24" {...common}>
          <rect className={c} strokeWidth="1.8" x="4" y="5" width="16" height="14" rx="2" />
        </svg>
      );
  }
}
