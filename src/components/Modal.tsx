import type { ReactNode } from "react";
export function Modal({ open, onClose, children, full }: { open: boolean; onClose: () => void; children: ReactNode; full?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-overlay sm:items-center" onClick={onClose}>
      <div
        className={`animate-tab w-full bg-card shadow-xl ${full ? "h-full max-w-lg overflow-y-auto" : "max-w-md rounded-t-md border border-border p-5 sm:rounded-md pb-safe"}`}
        role="dialog" aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
