import clsx from "clsx";

const variants = {
  URGENT: "bg-signal-coral/12 text-signal-coral ring-signal-coral/20",
  HIGH: "bg-signal-coral/12 text-signal-coral ring-signal-coral/20",
  MODERATE: "bg-brass-100 text-brass-700 ring-brass-300/30",
  MEDIUM: "bg-brass-100 text-brass-700 ring-brass-300/30",
  REGULAR: "bg-jade-100 text-jade-800 ring-jade-400/20",
  Regular: "bg-jade-100 text-jade-800 ring-jade-400/20"
};

export default function PriorityBadge({ priority }) {
  const label = {
    URGENT: "Urgent",
    HIGH: "Urgent",
    MODERATE: "Moderate",
    MEDIUM: "Moderate",
    REGULAR: "Regular"
  }[priority] || priority;
  return (
    <span className={clsx("inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-extrabold ring-1", variants[priority] || variants.Regular)}>
      {label}
    </span>
  );
}
