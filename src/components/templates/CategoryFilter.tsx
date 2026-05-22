"use client"

import { useRouter, useSearchParams } from "next/navigation"

const CATEGORIES = [
  { id: "ALL",       label: "All",        emoji: "✦"  },
  { id: "REACTION",  label: "Reaction",   emoji: "😤" },
  { id: "GAMING",    label: "Gaming",     emoji: "🎮" },
  { id: "ANIME",     label: "Anime",      emoji: "✨" },
  { id: "BOLLYWOOD", label: "Bollywood",  emoji: "🎬" },
  { id: "INDIAN",    label: "Indian",     emoji: "🇮🇳" },
  { id: "CORPORATE", label: "Corporate",  emoji: "📊" },
  { id: "SPORTS",    label: "Sports",     emoji: "⚡" },
  { id: "ABSURDIST", label: "Absurdist",  emoji: "🌀" },
  { id: "WHOLESOME", label: "Wholesome",  emoji: "🌸" },
  { id: "POLITICAL", label: "Political",  emoji: "🏛️" },
]

const LABELS: {
  id: string
  label: string
  icon: string
  cls: string
  activeCls: string
}[] = [
  {
    id: "ALL",
    label: "All trends",
    icon: "·",
    cls: "border-border text-muted hover:text-foreground hover:border-muted",
    activeCls: "border-border bg-surface-elevated text-foreground",
  },
  {
    id: "RISING",
    label: "Rising",
    icon: "↑",
    cls: "border-amber-500/30 text-amber-400/70 hover:text-amber-400 hover:border-amber-500/60",
    activeCls: "border-amber-500/60 bg-amber-500/15 text-amber-300",
  },
  {
    id: "HOT",
    label: "Hot",
    icon: "🔥",
    cls: "border-red-500/30 text-red-400/70 hover:text-red-400 hover:border-red-500/60",
    activeCls: "border-red-500/60 bg-red-500/15 text-red-300",
  },
  {
    id: "CLASSIC",
    label: "Classic",
    icon: "⭐",
    cls: "border-violet-500/30 text-violet-400/70 hover:text-violet-400 hover:border-violet-500/60",
    activeCls: "border-violet-500/60 bg-violet-500/15 text-violet-300",
  },
  {
    id: "DEAD",
    label: "Dead",
    icon: "💀",
    cls: "border-zinc-600/30 text-zinc-500/70 hover:text-zinc-400 hover:border-zinc-500/60",
    activeCls: "border-zinc-600/50 bg-zinc-700/20 text-zinc-400",
  },
]

interface Props {
  activeCategory: string
  activeLabel: string
}

export function CategoryFilter({ activeCategory, activeLabel }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "ALL") params.delete(key)
    else params.set(key, value)
    const qs = params.toString()
    router.push(`/trending${qs ? `?${qs}` : ""}`, { scroll: false })
  }

  return (
    <div className="space-y-3 mb-8">
      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
        {CATEGORIES.map(({ id, label, emoji }) => {
          const isActive = activeCategory === id
          return (
            <button
              key={id}
              onClick={() => setFilter("category", id)}
              className={`
                shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold
                border transition-all duration-150 cursor-pointer
                ${isActive
                  ? "border-violet-500/60 bg-gradient-to-r from-violet-600/25 to-fuchsia-600/25 text-violet-200 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                  : "border-border text-muted hover:text-foreground hover:border-border/80 hover:bg-surface-elevated"
                }
              `}
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </button>
          )
        })}
      </div>

      {/* Trend label badges */}
      <div className="flex gap-2 flex-wrap">
        {LABELS.map(({ id, label, icon, cls, activeCls }) => {
          const isActive = activeLabel === id
          return (
            <button
              key={id}
              onClick={() => setFilter("label", id)}
              className={`
                flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold
                border uppercase tracking-wider transition-all duration-150 cursor-pointer
                ${isActive ? activeCls : cls}
              `}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
