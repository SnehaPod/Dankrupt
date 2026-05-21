import { notFound } from "next/navigation"
import { db } from "@/server/db/client"
import { EditorRemixLoader } from "@/components/editor/EditorRemixLoader"
import type { TemplateFull, TextRegion } from "@/types"
import type { TextLayer as StoreTextLayer } from "@/store/editor"

interface Props {
  params: Promise<{ memeId: string }>
}

export default async function RemixPage({ params }: Props) {
  const { memeId } = await params

  try {
    const meme = await db.meme.findUnique({
      where: { shortId: memeId },
      include: { template: true },
    })

    if (!meme) notFound()

    // Reconstruct layers from saved canvasState
    const canvasState = meme.canvasState as { layers?: StoreTextLayer[] }
    const layers: StoreTextLayer[] = canvasState?.layers ?? []

    // Reconstruct template if one was used
    let template: TemplateFull | null = null
    if (meme.template) {
      const t = meme.template
      template = {
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
        usageCount: t.usageCount,
        textRegions: t.textRegions as unknown as TextRegion[],
      }
    }

    return (
      <EditorRemixLoader
        template={template}
        layers={layers}
        sourceMemeId={meme.shortId}
      />
    )
  } catch {
    notFound()
  }
}
