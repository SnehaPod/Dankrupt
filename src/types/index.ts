import type { TemplateCategory, TrendLabel } from "@prisma/client"

export type { TemplateCategory, TrendLabel }

export interface TextRegion {
  id: string
  x: number
  y: number
  w: number
  h: number
  defaultText: string
  fontSize: number
  align: "left" | "center" | "right"
}

export interface TemplateSlim {
  id: string
  slug: string
  name: string
  imageUrl: string
  /** Downsized animated GIF URL — used for hover previews (smaller file) */
  animatedUrl?: string
  /** Full-resolution original GIF URL — used for frame-accurate GIF export */
  originalGifUrl?: string
  width: number
  height: number
  category: TemplateCategory
  trendLabel: TrendLabel
  trendScore: number
  tags: string[]
  usageCount: number
}

export interface TemplateFull extends TemplateSlim {
  textRegions: TextRegion[]
}

export interface MemeSlim {
  id: string
  shortId: string
  imageUrl: string
  width: number
  height: number
  likeCount: number
  remixCount: number
  createdAt: string
}

export type CaptionTone =
  | "genz"
  | "absurd"
  | "corporate"
  | "sarcastic"
  | "cursed"
  | "wholesome"

export type ExportFormat = "png" | "jpeg" | "gif" | "mp4"
