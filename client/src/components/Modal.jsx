import { X } from "lucide-react";

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/70 px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-glass dark:bg-ink-900" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-ink-900 dark:text-white">{title}</h2>
          <button type="button" onClick={onClose} className="focus-ring grid h-10 w-10 place-items-center rounded-xl text-ink-500 hover:bg-ink-50 dark:text-white dark:hover:bg-white/10" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
