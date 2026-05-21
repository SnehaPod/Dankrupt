import { Suspense } from "react"
import { db } from "@/server/db/client"
import { getAllImgflipTemplates } from "@/server/lib/imgflip"
import {
  getAllGiphyTemplates,
  searchGiphyTemplates,
  isGiphyConfigured,
} from "@/server/lib/giphy"
import { TemplateGrid } from "@/components/templates/TemplateGrid"
import { CategoryFilter } from "@/components/templates/CategoryFilter"
import { SearchBar } from "@/components/templates/SearchBar"
import type { TemplateSlim } from "@/types"

export const dynamic = "force-dynamic"

interface PageProps {
  searchParams: Promise<{ category?: string; label?: string; q?: string }>
}

export default async function TrendingPage({ searchParams }: PageProps) {
  const { category, label, q } = await searchParams
  const query = q?.trim() ?? ""

  // ── Fetch all sources in parallel ────────────────────────────────────────
  const [imgflipTemplates, giphyTemplates, dbTemplates] = await Promise.all([
    getAllImgflipTemplates().catch(() => [] as TemplateSlim[]),

    (query
      ? searchGiphyTemplates(query)
      : getAllGiphyTemplates()
    ).catch(() => [] as TemplateSlim[]),

    db.template
      .findMany({
        where: {
          isPublic: true,
          ...(query
            ? { name: { contains: query, mode: "insensitive" as const } }
            : {}),
        },
        orderBy: [{ trendScore: "desc" }, { usageCount: "desc" }],
        take: 48,
        select: {
          id: true, slug: true, name: true, imageUrl: true,
          width: true, height: true, category: true, trendLabel: true,
          trendScore: true, tags: true, usageCount: true,
        },
      })
      .catch(() => [] as TemplateSlim[]),
  ])

  // ── Filter + merge ────────────────────────────────────────────────────────
  const imgflipFiltered = query
    ? imgflipTemplates.filter((t) =>
        t.name.toLowerCase().includes(query.toLowerCase())
      )
    : imgflipTemplates

  const combined = interleave(imgflipFiltered, giphyTemplates, 4)

  const dbIds = new Set(dbTemplates.map((t) => t.slug))
  const merged: TemplateSlim[] = [
    ...combined,
    ...dbTemplates.filter(
      (t) =>
        !t.slug.startsWith("imgflip-") &&
        !t.slug.startsWith("giphy-") &&
        !dbIds.has(t.slug)
    ),
  ]

  const filtered = merged.filter((t) => {
    if (category && category !== "ALL" && t.category !== category) return false
    if (label && label !== "ALL" && t.trendLabel !== label) return false
    return true
  })

  const gifCount = filtered.filter((t) => t.animatedUrl).length

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
            <h1 className="text-4xl font-black tracking-tight gradient-text">
              {query ? `"${query}"` : "Trending"}
            </h1>
            {!query && (
              <p className="text-muted text-sm font-mono">
                what the internet is losing its mind over
              </p>
            )}
          </div>

          {/* Stats pills */}
          <div className="flex flex-wrap items-center gap-2">
            <StatPill>
              {filtered.length} template{filtered.length !== 1 ? "s" : ""}
            </StatPill>
            {!query && (
              <StatPill dim>via Imgflip</StatPill>
            )}
            {isGiphyConfigured && gifCount > 0 && (
              <StatPill accent>✦ {gifCount} GIFs · Giphy</StatPill>
            )}
            {query && filtered.length === 0 && (
              <StatPill dim>no matches</StatPill>
            )}
          </div>
        </div>

        {/* ── Search bar ────────────────────────────────────────────────── */}
        <SearchBar initialQuery={query} category={category} label={label} />

        {/* ── Category + label filters ──────────────────────────────────── */}
        <Suspense fallback={<div className="h-16" />}>
          <CategoryFilter
            activeCategory={category ?? "ALL"}
            activeLabel={label ?? "ALL"}
          />
        </Suspense>

        {/* ── Grid ──────────────────────────────────────────────────────── */}
        <TemplateGrid
          templates={filtered}
          emptyMessage={
            query
              ? `No templates matched "${query}" — try something else.`
              : undefined
          }
        />
      </div>
    </div>
  )
}

// ── Tiny stat-pill helper (server component, no extra file needed) ────────────
function StatPill({
  children,
  accent,
  dim,
}: {
  children: React.ReactNode
  accent?: boolean
  dim?: boolean
}) {
  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono border"
  if (accent)
    return (
      <span className={`${base} border-violet-500/40 bg-violet-500/10 text-violet-300`}>
        {children}
      </span>
    )
  if (dim)
    return (
      <span className={`${base} border-border text-muted/50`}>{children}</span>
    )
  return (
    <span className={`${base} border-border text-muted`}>{children}</span>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function interleave<T>(base: T[], inserts: T[], every: number): T[] {
  if (!inserts.length) return base
  const result: T[] = []
  let insertIdx = 0
  for (let i = 0; i < base.length; i++) {
    if (i > 0 && i % every === 0 && insertIdx < inserts.length) {
      result.push(inserts[insertIdx++])
    }
    result.push(base[i])
  }
  while (insertIdx < inserts.length) result.push(inserts[insertIdx++])
  return result
}
