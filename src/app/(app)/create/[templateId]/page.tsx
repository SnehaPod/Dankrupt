import { notFound } from "next/navigation"
import { db } from "@/server/db/client"
import { getImgflipTemplateById } from "@/server/lib/imgflip"
import { getGiphyTemplateById } from "@/server/lib/giphy"
import { EditorPageWithTemplate } from "@/components/editor/EditorPageWithTemplate"
import type { TemplateFull, TextRegion } from "@/types"

interface Props {
  params: Promise<{ templateId: string }>
}

export default async function CreateWithTemplatePage({ params }: Props) {
  const { templateId } = await params

  const template = await resolveTemplate(templateId)
  if (!template) notFound()

  return <EditorPageWithTemplate template={template} />
}

// ── Template resolution: DB → Imgflip → Giphy → upsert ──────────────────────

async function resolveTemplate(templateId: string): Promise<TemplateFull | null> {
  // 1. Try DB first (covers cuid records and previously-upserted Imgflip/Giphy ones)
  try {
    const raw = await db.template.findFirst({
      where: { OR: [{ id: templateId }, { slug: templateId }], isPublic: true },
    })
    if (raw) {
      return {
        id: raw.id,
        slug: raw.slug,
        name: raw.name,
        imageUrl: raw.imageUrl,
        width: raw.width,
        height: raw.height,
        category: raw.category,
        trendLabel: raw.trendLabel,
        trendScore: raw.trendScore,
        tags: raw.tags,
        usageCount: raw.usageCount,
        textRegions: raw.textRegions as unknown as TextRegion[],
      }
    }
  } catch { /* DB unavailable */ }

  // 2. Try Giphy (handles "giphy_<id>" slugs from the trending page)
  if (templateId.startsWith("giphy_") || templateId.startsWith("giphy-")) {
    const giphyId = templateId.replace(/^giphy[_-]/, "")
    const giphyTemplate = await getGiphyTemplateById(giphyId)
    if (giphyTemplate) {
      upsertTemplate(giphyTemplate).catch(() => null)
      return giphyTemplate
    }
  }

  // 3. Try Imgflip (handles "imgflip_<id>" slugs and bare numeric IDs)
  const imgflipId = templateId.startsWith("imgflip_")
    ? templateId.slice("imgflip_".length)
    : templateId

  const imgflipTemplate = await getImgflipTemplateById(imgflipId)
  if (!imgflipTemplate) return null

  // Upsert into DB so remix/export lineage tracking has a real FK record.
  // Fire-and-forget — don't block the editor render on the write.
  upsertTemplate(imgflipTemplate).catch(() => null)

  return imgflipTemplate
}

async function upsertTemplate(t: TemplateFull) {
  await db.template.upsert({
    where: { slug: t.slug },
    update: { trendScore: t.trendScore, usageCount: t.usageCount },
    create: {
      id: t.id,
      slug: t.slug,
      name: t.name,
      imageUrl: t.imageUrl,
      width: t.width,
      height: t.height,
      category: t.category,
      trendLabel: t.trendLabel,
      trendScore: t.trendScore,
      tags: t.tags,
      textRegions: t.textRegions as unknown as object[],
      usageCount: t.usageCount,
      isPublic: true,
    },
  })
}
