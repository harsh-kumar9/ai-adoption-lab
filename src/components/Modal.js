// src/components/Modal.js
"use client";

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-1/2 top-16 -translate-x-1/2 w-[min(640px,calc(100%-2rem))] rounded-2xl border bg-white shadow-2xl z-50">
        <div className="px-4 py-3 border-b font-semibold">{title}</div>
        <div className="p-4 text-sm leading-relaxed">{children}</div>
        <div className="px-4 py-3 border-t flex justify-end">
          <button className="text-sm text-slate-600 hover:text-slate-800" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
