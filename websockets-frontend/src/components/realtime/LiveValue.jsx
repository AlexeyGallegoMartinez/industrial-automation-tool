import { formatTelemetryValue } from "../../utils/formatters";

export default function LiveValue({ label, tag, tone = "default" }) {
  const toneClass = {
    default: "border-zinc-800 bg-zinc-900/70 text-zinc-100",
    good: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
    warn: "border-amber-400/30 bg-amber-400/10 text-amber-100",
    fault: "border-rose-400/30 bg-rose-400/10 text-rose-100",
    robot: "border-sky-400/30 bg-sky-400/10 text-sky-100",
  };

  return (
    <div className={`rounded-md border p-4 ${toneClass[tone]}`}>
      <p className="text-xs font-medium uppercase tracking-normal text-zinc-400">
        {label}
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold">
          {formatTelemetryValue(tag)}
        </span>
        {tag?.engineeringUnit ? (
          <span className="text-sm text-zinc-400">{tag.engineeringUnit}</span>
        ) : null}
      </div>
    </div>
  );
}
