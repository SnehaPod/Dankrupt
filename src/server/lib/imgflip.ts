import { unstable_cache } from "next/cache"
import type { TemplateFull, TemplateSlim, TextRegion, TemplateCategory, TrendLabel } from "@/types"

// ── Imgflip API types ─────────────────────────────────────────────────────────

interface ImgflipMeme {
  id: string
  name: string
  url: string
  width: number
  height: number
  box_count: number
  captions: number
}

interface ImgflipResponse {
  success: boolean
  data: { memes: ImgflipMeme[] }
}

// ── Fetch + cache (1 hour) ────────────────────────────────────────────────────

export const fetchImgflipTemplates = unstable_cache(
  async (): Promise<ImgflipMeme[]> => {
    const res = await fetch("https://api.imgflip.com/get_memes", {
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error(`Imgflip API error: ${res.status}`)
    const json = (await res.json()) as ImgflipResponse
    if (!json.success) throw new Error("Imgflip returned success=false")
    return json.data.memes
  },
  ["imgflip-templates"],
  { revalidate: 3600 }
)

// ── Category detection ────────────────────────────────────────────────────────

const CATEGORY_KEYWORDS: Array<[TemplateCategory, string[]]> = [
  ["ANIME",     ["anime", "manga", "naruto", "dragon ball", "one piece", "attack on titan", "jojo"]],
  ["GAMING",    ["gaming", "gamer", "minecraft", "fortnite", "mario", "pokemon", "dark souls", "among us", "game"]],
  ["BOLLYWOOD", ["bollywood", "hindi", "shah rukh", "baahubali", "dhoom"]],
  ["INDIAN",    ["indian", "desi", "chai", "modi", "iit", "jee"]],
  ["CORPORATE", ["corporate", "linkedin", "office", "meeting", "manager", "employee", "boss", "work", "salary"]],
  ["SPORTS",    ["sports", "football", "soccer", "basketball", "cricket", "nfl", "nba", "lebron", "messi"]],
  ["WHOLESOME", ["wholesome", "cute", "hug", "love", "happy", "dog", "cat", "puppy", "kitten"]],
  ["ABSURDIST", ["galaxy brain", "expanding", "cursed", "weird", "surreal", "glitch", "void"]],
]

function detectCategory(name: string): TemplateCategory {
  const lower = name.toLowerCase()
  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) return category
  }
  return "REACTION"
}

// ── Trend label from rank ─────────────────────────────────────────────────────

function trendLabelFromRank(rank: number): TrendLabel {
  if (rank <= 10) return "HOT"
  if (rank <= 30) return "RISING"
  if (rank <= 70) return "CLASSIC"
  return "DEAD"
}

// ── Text region generation from box_count ────────────────────────────────────

function generateTextRegions(boxCount: number, w: number, h: number): TextRegion[] {
  const safe = Math.max(1, boxCount)

  if (safe === 1) {
    return [{
      id: "caption",
      x: 10, y: Math.round(h * 0.7),
      w: w - 20, h: Math.round(h * 0.25),
      defaultText: "Caption here",
      fontSize: 36, align: "center",
    }]
  }

  if (safe === 2) {
    return [
      { id: "top",    x: 10, y: 10,             w: w - 20, h: Math.round(h * 0.2), defaultText: "TOP TEXT",    fontSize: 40, align: "center" },
      { id: "bottom", x: 10, y: Math.round(h * 0.76), w: w - 20, h: Math.round(h * 0.2), defaultText: "BOTTOM TEXT", fontSize: 40, align: "center" },
    ]
  }

  // 3+ boxes: distribute vertically with even spacing
  const slotH = Math.round(h / safe)
  return Array.from({ length: safe }, (_, i) => ({
    id: `text${i + 1}`,
    x: 10,
    y: Math.round(slotH * i + slotH * 0.1),
    w: w - 20,
    h: Math.round(slotH * 0.75),
    defaultText: i === 0 ? "TOP TEXT" : i === safe - 1 ? "BOTTOM TEXT" : `Text ${i + 1}`,
    fontSize: 32,
    align: "center" as const,
  }))
}

// ── Converters ────────────────────────────────────────────────────────────────

export function imgflipToSlim(meme: ImgflipMeme, rank: number): TemplateSlim {
  return {
    id: `imgflip_${meme.id}`,
    slug: `imgflip-${meme.id}`,
    name: meme.name,
    imageUrl: meme.url,
    width: meme.width,
    height: meme.height,
    category: detectCategory(meme.name),
    trendLabel: trendLabelFromRank(rank),
    trendScore: Math.max(0, 100 - rank),
    tags: [],
    usageCount: meme.captions,
  }
}

export function imgflipToFull(meme: ImgflipMeme, rank: number): TemplateFull {
  const slim = imgflipToSlim(meme, rank)
  return {
    ...slim,
    textRegions: generateTextRegions(meme.box_count, meme.width, meme.height),
  }
}

// ── Helpers used by pages ─────────────────────────────────────────────────────

export async function getImgflipTemplateById(
  imgflipId: string
): Promise<TemplateFull | null> {
  try {
    const memes = await fetchImgflipTemplates()
    const idx = memes.findIndex((m) => m.id === imgflipId)
    if (idx === -1) return null
    return imgflipToFull(memes[idx], idx + 1)
  } catch {
    return null
  }
}

export async function getAllImgflipTemplates(): Promise<TemplateSlim[]> {
  try {
    const memes = await fetchImgflipTemplates()
    return memes.map((m, i) => imgflipToSlim(m, i + 1))
  } catch {
    return []
  }
}
