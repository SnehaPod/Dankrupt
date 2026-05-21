"use client"

import { useRef } from "react"
import { useRouter } from "next/navigation"

interface Props {
  initialQuery?: string
  category?: string
  label?: string
}

export function SearchBar({ initialQuery, category, label }: Props) {
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  function push(value: string) {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams()
      if (value.trim()) params.set("q", value.trim())
      if (category && category !== "ALL") params.set("category", category)
      if (label && label !== "ALL") params.set("label", label)
      const qs = params.toString()
      router.push(`/trending${qs ? `?${qs}` : ""}`)
    }, 380)
  }

  return (
    <div className="relative mb-5">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm">
        🔍
      </span>
      <input
        type="search"
        defaultValue={initialQuery}
        placeholder="Search meme templates and GIFs…"
        onChange={(e) => push(e.target.value)}
        className="
          w-full bg-surface-elevated border border-border rounded-full
          pl-10 pr-4 py-2.5 text-sm
          focus:outline-none focus:border-accent/60
          focus:shadow-[0_0_0_3px_rgba(168,85,247,0.15)]
          placeholder:text-muted/40 transition-all duration-200
        "
      />
    </div>
  )
}
