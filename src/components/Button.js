"use client";
export function Button({ children, variant="primary", className="", ...props }){
  const base = "rounded-lg px-3 py-2 text-sm transition-colors focus-ring";
  const styles = {
    primary: "bg-[var(--primary)] text-[var(--primary-ink)] hover:bg-indigo-700",
    ghost:   "border border-[var(--border)] hover:bg-black/5",
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props}>{children}</button>;
}
