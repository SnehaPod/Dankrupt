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

// ── Named layout overrides ────────────────────────────────────────────────────
// Positions are fractional [0..1] so they work at any template resolution.

interface RegionSpec {
  id: string
  /** Left edge as fraction of template width */
  xf: number
  /** Top edge as fraction of template height */
  yf: number
  /** Region width as fraction of template width */
  wf: number
  /** Region height as fraction of template height */
  hf: number
  defaultText: string
  fontSize: number
  align: "left" | "center" | "right"
}

function r(
  id: string, xf: number, yf: number, wf: number, hf: number,
  defaultText: string, fontSize = 32, align: "left" | "center" | "right" = "center"
): RegionSpec {
  return { id, xf, yf, wf, hf, defaultText, fontSize, align }
}

/** Match on lowercase substrings in the template name. */
const NAMED_LAYOUTS: Array<{ match: string[]; regions: RegionSpec[] }> = [
  // ── Drake Hotline Bling ───────────────────────────────────────────────────
  // Two vertical panels; text sits in the right half of each.
  {
    match: ["drake", "hotline bling"],
    regions: [
      r("reject",  0.52, 0.04, 0.44, 0.42, "The thing I reject 🙅",  28, "left"),
      r("approve", 0.52, 0.54, 0.44, 0.42, "The thing I actually want", 28, "left"),
    ],
  },

  // ── Two Buttons ──────────────────────────────────────────────────────────
  {
    match: ["two buttons"],
    regions: [
      r("option_a", 0.04, 0.04, 0.38, 0.36, "Option A", 28),
      r("option_b", 0.58, 0.04, 0.38, 0.36, "Option B", 28),
    ],
  },

  // ── Change My Mind ───────────────────────────────────────────────────────
  {
    match: ["change my mind"],
    regions: [
      r("sign", 0.28, 0.44, 0.68, 0.36, "Something controversial — change my mind", 26),
    ],
  },

  // ── Expanding / Galaxy Brain ──────────────────────────────────────────────
  // 4 horizontal strips; text goes on the left (brain images on the right).
  {
    match: ["expanding brain", "galaxy brain"],
    regions: [
      r("level1", 0.03, 0.03, 0.54, 0.21, "The basic take",        26, "left"),
      r("level2", 0.03, 0.27, 0.54, 0.21, "The larger-brain take", 26, "left"),
      r("level3", 0.03, 0.52, 0.54, 0.21, "The galaxy-brain take", 26, "left"),
      r("level4", 0.03, 0.76, 0.54, 0.21, "The universe-brain take", 26, "left"),
    ],
  },

  // ── Gru's Plan ───────────────────────────────────────────────────────────
  // 4 panels in a 2×2 grid.
  {
    match: ["gru's plan", "gru plan", "gru presents"],
    regions: [
      r("step1",    0.51, 0.04, 0.46, 0.20, "Step 1: The plan",      28, "left"),
      r("step2",    0.51, 0.29, 0.46, 0.20, "Step 2: It's working",  28, "left"),
      r("step3",    0.51, 0.54, 0.46, 0.20, "Step 3: Wait, that's bad", 28, "left"),
      r("step4",    0.51, 0.78, 0.46, 0.20, "Step 3: Wait, that's bad", 28, "left"),
    ],
  },

  // ── Distracted Boyfriend ─────────────────────────────────────────────────
  {
    match: ["distracted boyfriend"],
    regions: [
      r("other_woman", 0.56, 0.02, 0.40, 0.22, "The shiny new thing", 26),
      r("boyfriend",   0.22, 0.72, 0.32, 0.22, "Me",                  28),
      r("girlfriend",  0.00, 0.60, 0.18, 0.22, "My responsibilities", 22),
    ],
  },

  // ── Woman Yelling at Cat ──────────────────────────────────────────────────
  {
    match: ["woman yelling at cat", "yelling at cat"],
    regions: [
      r("woman", 0.03, 0.62, 0.44, 0.32, "Me at 2 am",      32),
      r("cat",   0.53, 0.62, 0.44, 0.32, "My brain", 32),
    ],
  },

  // ── Mocking SpongeBob ────────────────────────────────────────────────────
  {
    match: ["mocking spongebob", "mocking"],
    regions: [
      r("normal",  0.05, 0.03, 0.90, 0.18, "A perfectly normal statement",     36),
      r("mocking", 0.05, 0.65, 0.90, 0.25, "a PeRfEcTlY nOrMaL sTaTeMeNt 🤪", 36),
    ],
  },

  // ── Uno Draw 25 / Draw Cards ──────────────────────────────────────────────
  {
    match: ["uno draw", "draw 25", "draw cards"],
    regions: [
      r("choice",      0.04, 0.04, 0.44, 0.22, "Just do the obvious thing", 28),
      r("consequence", 0.04, 0.70, 0.44, 0.22, "Or draw 25 cards",         28),
    ],
  },

  // ── Surprised Pikachu ────────────────────────────────────────────────────
  {
    match: ["surprised pikachu"],
    regions: [
      r("setup",    0.05, 0.03, 0.90, 0.18, "Does the thing",          34),
      r("reaction", 0.05, 0.72, 0.90, 0.22, "*surprised Pikachu face*", 36),
    ],
  },

  // ── Is This a Pigeon / Butterfly ─────────────────────────────────────────
  {
    match: ["is this a pigeon", "is this a butterfly"],
    regions: [
      r("person",    0.00, 0.68, 0.34, 0.22, "Me",                    30),
      r("butterfly", 0.60, 0.08, 0.36, 0.22, "Clearly obvious thing", 26),
      r("question",  0.34, 0.80, 0.62, 0.16, "Is this a meme?",       28),
    ],
  },

  // ── Trade Offer ──────────────────────────────────────────────────────────
  {
    match: ["trade offer", "i will receive"],
    regions: [
      r("i_receive",   0.04, 0.28, 0.44, 0.28, "I receive: nothing",     28),
      r("you_receive", 0.52, 0.28, 0.44, 0.28, "You receive: my problems", 28),
    ],
  },

  // ── Running Away Balloon ─────────────────────────────────────────────────
  {
    match: ["running away balloon", "running away"],
    regions: [
      r("person",  0.02, 0.48, 0.38, 0.24, "Me",                       32),
      r("balloon", 0.56, 0.02, 0.38, 0.22, "Important thing I'm ignoring", 26),
    ],
  },

  // ── Always Has Been ──────────────────────────────────────────────────────
  {
    match: ["always has been"],
    regions: [
      r("question", 0.02, 0.06, 0.38, 0.22, "Wait, it's all X?",  26),
      r("answer",   0.56, 0.64, 0.40, 0.22, "Always has been. 🔫", 26),
    ],
  },

  // ── This Is Fine ─────────────────────────────────────────────────────────
  {
    match: ["this is fine"],
    regions: [
      r("caption", 0.03, 0.03, 0.58, 0.20, "This is fine. 🔥", 40),
    ],
  },

  // ── Left Exit 12 Off Ramp ────────────────────────────────────────────────
  {
    match: ["left exit 12", "left exit"],
    regions: [
      r("sign",   0.36, 0.08, 0.28, 0.20, "The responsible choice", 24),
      r("swerve", 0.62, 0.46, 0.34, 0.20, "The fun choice",         28),
    ],
  },

  // ── Hide the Pain Harold ─────────────────────────────────────────────────
  {
    match: ["hide the pain harold", "harold"],
    regions: [
      r("reality", 0.05, 0.04, 0.90, 0.20, "What's actually happening in my life", 34),
      r("smile",   0.05, 0.72, 0.90, 0.22, "My LinkedIn profile",                  36),
    ],
  },

  // ── One Does Not Simply ──────────────────────────────────────────────────
  {
    match: ["one does not simply"],
    regions: [
      r("top",    0.05, 0.03, 0.90, 0.18, "One does not simply",  36),
      r("action", 0.05, 0.72, 0.90, 0.22, "Do the thing",         36),
    ],
  },

  // ── Oprah You Get a / Bees ───────────────────────────────────────────────
  {
    match: ["oprah you get", "you get a"],
    regions: [
      r("you_get", 0.05, 0.65, 0.90, 0.30, "You get a meme!", 40),
    ],
  },

  // ── Panik / Kalm ─────────────────────────────────────────────────────────
  {
    match: ["panik kalm", "panik", "kalm"],
    regions: [
      r("panic1", 0.52, 0.04, 0.44, 0.20, "PANIK: The scary thing",       28, "left"),
      r("calm",   0.52, 0.38, 0.44, 0.20, "kalm: Actually it's fine",     28, "left"),
      r("panic2", 0.52, 0.72, 0.44, 0.20, "PANIK: Wait it's not fine",    28, "left"),
    ],
  },
]

/** Return text regions for a known meme layout, or null if no preset matches. */
function findNamedLayout(name: string, w: number, h: number): TextRegion[] | null {
  const lower = name.toLowerCase()
  for (const entry of NAMED_LAYOUTS) {
    if (entry.match.some((m) => lower.includes(m))) {
      return entry.regions.map((spec) => ({
        id:          spec.id,
        x:           Math.round(spec.xf * w),
        y:           Math.round(spec.yf * h),
        w:           Math.round(spec.wf * w),
        h:           Math.round(spec.hf * h),
        defaultText: spec.defaultText,
        fontSize:    spec.fontSize,
        align:       spec.align,
      }))
    }
  }
  return null
}

// ── Text region generation ────────────────────────────────────────────────────

function generateTextRegions(boxCount: number, name: string, w: number, h: number): TextRegion[] {
  // 1. Named preset wins — positions and labels tuned for this specific meme.
  const named = findNamedLayout(name, w, h)
  if (named) return named

  // 2. Generic fallback based on box_count.
  const safe = Math.max(1, boxCount)

  if (safe === 1) {
    return [{
      id: "caption",
      x: 10, y: Math.round(h * 0.70),
      w: w - 20, h: Math.round(h * 0.25),
      defaultText: "Caption here",
      fontSize: 36, align: "center",
    }]
  }

  if (safe === 2) {
    return [
      { id: "top",    x: 10, y: 10,                      w: w - 20, h: Math.round(h * 0.20), defaultText: "TOP TEXT",    fontSize: 40, align: "center" },
      { id: "bottom", x: 10, y: Math.round(h * 0.76),    w: w - 20, h: Math.round(h * 0.20), defaultText: "BOTTOM TEXT", fontSize: 40, align: "center" },
    ]
  }

  // 3+ boxes — distribute vertically with even spacing.
  const slotH = Math.round(h / safe)
  return Array.from({ length: safe }, (_, i) => ({
    id: `text${i + 1}`,
    x: 10,
    y: Math.round(slotH * i + slotH * 0.10),
    w: w - 20,
    h: Math.round(slotH * 0.75),
    defaultText:
      i === 0       ? "TOP TEXT"    :
      i === safe - 1 ? "BOTTOM TEXT" :
      `Text ${i + 1}`,
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
    textRegions: generateTextRegions(meme.box_count, meme.name, meme.width, meme.height),
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
