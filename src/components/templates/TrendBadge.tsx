import type { TrendLabel } from "@/types"

const styles: Record<TrendLabel, string> = {
  RISING:  "bg-amber-500/15  text-amber-300  border-amber-500/35",
  HOT:     "bg-red-500/15    text-red-300    border-red-500/35",
  DEAD:    "bg-zinc-700/25   text-zinc-500   border-zinc-600/30",
  CLASSIC: "bg-violet-500/15 text-violet-300 border-violet-500/35",
}

const icons: Record<TrendLabel, string> = {
  RISING:  "↑",
  HOT:     "🔥",
  DEAD:    "💀",
  CLASSIC: "⭐",
}

export function TrendBadge({ label }: { label: TrendLabel }) {
  return (
    <span
      className={`
        shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5
        rounded-md text-[10px] font-bold tracking-wider border
        ${styles[label]}
      `}
    >
      <span>{icons[label]}</span>
      <span className="uppercase">{label.toLowerCase()}</span>
    </span>
  )
}
