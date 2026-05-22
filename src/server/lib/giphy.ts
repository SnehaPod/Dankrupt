import { unstable_cache } from "next/cache"
import type {
  TemplateFull,
  TemplateSlim,
  TextRegion,
  TemplateCategory,
  TrendLabel,
} from "@/types"

// ── Giphy API types ───────────────────────────────────────────────────────────

interface GiphyImageVariant {
  url: string
  width: string
  height: string
}

interface GiphyGif {
  id: string
  title: string
  images: {
    original: GiphyImageVariant
    original_still: GiphyImageVariant
    /** Smaller animated version used for hover previews */
    downsized_medium?: GiphyImageVariant
  }
}

interface GiphyResponse {
  data: GiphyGif[]
}

// ── Fetch + cache (1 hour) ────────────────────────────────────────────────────

const GIPHY_KEY = process.env.GIPHY_API_KEY

export const isGiphyConfigured = Boolean(GIPHY_KEY)

export const fetchGiphyTrending = unstable_cache(
  async (): Promise<GiphyGif[]> => {
    if (!GIPHY_KEY) return []
    const res = await fetch(
      `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_KEY}&limit=25&rating=g&bundle=messaging_non_clips`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error(`Giphy API error: ${res.status}`)
    const json = (await res.json()) as GiphyResponse
    return json.data ?? []
  },
  ["giphy-trending"],
  { revalidate: 3600 }
)

// ── Category detection (mirrors imgflip.ts) ───────────────────────────────────

const CATEGORY_KEYWORDS: Array<[TemplateCategory, string[]]> = [
  ["ANIME",     ["anime", "manga", "naruto", "dragon ball", "one piece", "attack on titan"]],
  ["GAMING",    ["gaming", "gamer", "minecraft", "fortnite", "mario", "pokemon", "game"]],
  ["BOLLYWOOD", ["bollywood", "hindi", "shah rukh", "baahubali"]],
  ["INDIAN",    ["indian", "desi", "chai", "modi"]],
  ["CORPORATE", ["corporate", "linkedin", "office", "meeting", "work", "boss", "salary"]],
  ["SPORTS",    ["sports", "football", "soccer", "basketball", "cricket", "nfl", "nba"]],
  ["WHOLESOME", ["wholesome", "cute", "hug", "love", "happy", "dog", "cat", "puppy"]],
  ["ABSURDIST", ["cursed", "weird", "surreal", "galaxy brain", "void"]],
]

function detectCategory(title: string): TemplateCategory {
  const lower = title.toLowerCase()
  for (const [cat, kws] of CATEGORY_KEYWORDS) {
    if (kws.some((kw) => lower.includes(kw))) return cat
  }
  return "REACTION"
}

function trendLabelFromRank(rank: number): TrendLabel {
  if (rank <= 5)  return "HOT"
  if (rank <= 15) return "RISING"
  if (rank <= 25) return "CLASSIC"
  return "DEAD"
}

// ── Converters ────────────────────────────────────────────────────────────────

export function giphyToSlim(gif: GiphyGif, rank: number): TemplateSlim {
  const orig     = gif.images.original
  const stillUrl = gif.images.original_still?.url ?? orig.url
  const animUrl  = (gif.images.downsized_medium ?? orig).url
  const w = parseInt(orig.width,  10) || 480
  const h = parseInt(orig.height, 10) || 270

  return {
    id:             `giphy_${gif.id}`,
    slug:           `giphy-${gif.id}`,
    name:           gif.title?.trim() || `GIF ${gif.id}`,
    imageUrl:       stillUrl,   // static first frame — used by canvas & Image component at rest
    animatedUrl:    animUrl,    // downsized — swapped in on hover (fast load)
    originalGifUrl: orig.url,   // full-resolution original — used for GIF re-encoding export
    width:  w,
    height: h,
    category:   detectCategory(gif.title ?? ""),
    trendLabel: trendLabelFromRank(rank),
    trendScore: Math.max(0, 100 - rank * 4),
    tags:       ["gif", "animated"],
    usageCount: 0,
  }
}

export function giphyToFull(gif: GiphyGif, rank: number): TemplateFull {
  const slim = giphyToSlim(gif, rank)
  const { width: w, height: h } = slim

  // Classic top-text / bottom-text layout for all GIF templates
  const textRegions: TextRegion[] = [
    {
      id: "top",
      x: 10, y: 10,
      w: w - 20, h: Math.round(h * 0.2),
      defaultText: "TOP TEXT",
      fontSize: 40, align: "center",
    },
    {
      id: "bottom",
      x: 10, y: Math.round(h * 0.78),
      w: w - 20, h: Math.round(h * 0.2),
      defaultText: "BOTTOM TEXT",
      fontSize: 40, align: "center",
    },
  ]

  return { ...slim, textRegions }
}

// ── Helpers used by pages ─────────────────────────────────────────────────────

export async function getGiphyTemplateById(
  giphyId: string
): Promise<TemplateFull | null> {
  if (!GIPHY_KEY) return null
  try {
    const res = await fetch(
      `https://api.giphy.com/v1/gifs/${giphyId}?api_key=${GIPHY_KEY}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    const json = (await res.json()) as { data: GiphyGif }
    const gif = json.data
    if (!gif?.id) return null
    return giphyToFull(gif, 1)
  } catch {
    return null
  }
}

export async function getAllGiphyTemplates(): Promise<TemplateSlim[]> {
  try {
    const gifs = await fetchGiphyTrending()
    return gifs.map((g, i) => giphyToSlim(g, i + 1))
  } catch {
    return []
  }
}

// ── Category → Giphy search keyword ──────────────────────────────────────────

const CATEGORY_GIPHY_QUERY: Partial<Record<TemplateCategory, string>> = {
  REACTION:   "reaction meme",
  GAMING:     "gaming meme",
  ANIME:      "anime meme",
  BOLLYWOOD:  "bollywood",
  INDIAN:     "desi india meme",
  CORPORATE:  "office work meme",
  SPORTS:     "sports meme",
  ABSURDIST:  "weird meme",
  WHOLESOME:  "wholesome cute",
  POLITICAL:  "politics meme",
}

/**
 * Fetch Giphy GIFs matched to a specific template category.
 * Results are force-tagged with the requested category so the trending-page
 * category filter passes even when Giphy titles don't contain the keyword.
 */
export async function getGiphyByCategory(category: TemplateCategory): Promise<TemplateSlim[]> {
  const q = CATEGORY_GIPHY_QUERY[category]
  if (!q || !GIPHY_KEY) return []
  const results = await searchGiphyTemplates(q)
  // Force-tag every result so it passes the downstream category filter
  return results.map((t) => ({ ...t, category }))
}

/**
 * Search Giphy by keyword. Results are cached per query for 1 hour.
 * Returns [] when GIPHY_API_KEY is not set.
 */
export async function searchGiphyTemplates(query: string): Promise<TemplateSlim[]> {
  if (!GIPHY_KEY || !query.trim()) return []
  try {
    const res = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(query.trim())}&limit=20&rating=g`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const json = (await res.json()) as GiphyResponse
    return (json.data ?? []).map((g, i) => giphyToSlim(g, i + 1))
  } catch {
    return []
  }
}
