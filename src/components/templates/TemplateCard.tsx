"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { TrendBadge } from "./TrendBadge"
import type { TemplateSlim } from "@/types"
import type { TemplateCategory } from "@prisma/client"

// Colour per category so each card chip has personality
const CATEGORY_CHIP: Record<TemplateCategory, { bg: string; text: string; label: string }> = {
  REACTION:  { bg: "bg-orange-500/15",  text: "text-orange-300",  label: "reaction"  },
  GAMING:    { bg: "bg-green-500/15",   text: "text-green-300",   label: "gaming"    },
  ANIME:     { bg: "bg-pink-500/15",    text: "text-pink-300",    label: "anime"     },
  BOLLYWOOD: { bg: "bg-yellow-500/15",  text: "text-yellow-300",  label: "bollywood" },
  INDIAN:    { bg: "bg-orange-500/15",  text: "text-orange-200",  label: "indian"    },
  CORPORATE: { bg: "bg-blue-500/15",    text: "text-blue-300",    label: "corporate" },
  SPORTS:    { bg: "bg-cyan-500/15",    text: "text-cyan-300",    label: "sports"    },
  ABSURDIST: { bg: "bg-fuchsia-500/15", text: "text-fuchsia-300", label: "absurdist" },
  WHOLESOME: { bg: "bg-rose-500/15",    text: "text-rose-300",    label: "wholesome" },
  POLITICAL: { bg: "bg-slate-500/15",   text: "text-slate-300",   label: "political" },
  OTHER:     { bg: "bg-zinc-500/15",    text: "text-zinc-400",    label: "other"     },
}

export function TemplateCard({ template }: { template: TemplateSlim }) {
  const isGif = Boolean(template.animatedUrl)
  const [hovered, setHovered] = useState(false)

  const imgSrc = isGif && hovered ? template.animatedUrl! : template.imageUrl
  const chip = CATEGORY_CHIP[template.category]

  return (
    <Link
      href={`/create/${template.id}`}
      className="group relative flex flex-col rounded-xl border border-border/70 overflow-hidden bg-surface card-glow"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[#070712] overflow-hidden">
        <Image
          key={imgSrc}
          src={imgSrc}
          alt={template.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized
        />

        {/* GIF badge — gradient pill */}
        {isGif && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider text-white bg-gradient-to-r from-violet-600/90 to-fuchsia-600/90 shadow-sm">
            GIF
          </span>
        )}

        {/* Static hover overlay */}
        {!isGif && (
          <div className="absolute inset-0 bg-gradient-to-t from-violet-900/70 via-violet-900/20 to-transparent flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-white font-bold text-sm tracking-wide drop-shadow">
              Use template →
            </span>
          </div>
        )}

        {/* GIF hover bottom bar */}
        {isGif && hovered && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-r from-violet-700/95 to-fuchsia-700/95 flex items-center justify-center py-1.5">
            <span className="text-white font-bold text-xs tracking-wide">
              Use template →
            </span>
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="p-2.5 flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-tight line-clamp-2 flex-1 text-foreground/90">
          {template.name}
        </p>
        <TrendBadge label={template.trendLabel} />
      </div>

      {/* Category chip */}
      <div className="px-2.5 pb-2.5 flex items-center gap-1.5">
        <span
          className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${chip.bg} ${chip.text}`}
        >
          {chip.label}
        </span>
        {isGif && (
          <span className="text-[10px] font-mono text-violet-400/60">· animated</span>
        )}
      </div>
    </Link>
  )
}
