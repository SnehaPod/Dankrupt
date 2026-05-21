import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { db } from "@/server/db/client"
import { ShareButtons } from "@/components/meme/ShareButtons"
import { RemixLineage } from "@/components/meme/RemixLineage"

interface Props {
  params: Promise<{ memeId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { memeId } = await params
  try {
    const meme = await db.meme.findUnique({
      where: { shortId: memeId },
      select: { imageUrl: true, template: { select: { name: true } } },
    })
    if (meme) {
      return {
        title: meme.template?.name
          ? `${meme.template.name} — Dankrupt`
          : "Meme — Dankrupt",
        openGraph: {
          images: [{ url: meme.imageUrl, width: 800, height: 600 }],
        },
        twitter: { card: "summary_large_image" },
      }
    }
  } catch { /* DB unavailable */ }
  return { title: "Dankrupt" }
}

export default async function MemePage({ params }: Props) {
  const { memeId } = await params

  let meme: Awaited<ReturnType<typeof db.meme.findUnique>> & {
    author?: { username: string; displayName: string | null } | null
    template?: { name: string; id: string } | null
  } | null = null

  let lineage: { chain: { shortId: string; imageUrl: string }[]; remixes: { shortId: string; imageUrl: string }[] } = {
    chain: [],
    remixes: [],
  }

  try {
    meme = await db.meme.findUnique({
      where: { shortId: memeId },
      include: {
        author: { select: { username: true, displayName: true } },
        template: { select: { name: true, id: true } },
      },
    })

    if (!meme) notFound()

    // Increment view count (fire-and-forget)
    db.meme.update({ where: { shortId: memeId }, data: { viewCount: { increment: 1 } } }).catch(() => null)

    // Build lineage: walk ancestors
    const chain: typeof lineage.chain = []
    let currentId: string | null = meme.id
    while (currentId) {
      const node: { shortId: string; imageUrl: string; remixOf: { sourceMemeId: string } | null } | null =
        await db.meme.findUnique({
          where: { id: currentId },
          select: { shortId: true, imageUrl: true, remixOf: { select: { sourceMemeId: true } } },
        })
      if (!node) break
      chain.unshift({ shortId: node.shortId, imageUrl: node.imageUrl })
      currentId = node.remixOf?.sourceMemeId ?? null
    }

    const children = await db.remix.findMany({
      where: { sourceMemeId: meme.id },
      include: { newMeme: { select: { shortId: true, imageUrl: true } } },
      take: 12,
      orderBy: { createdAt: "desc" },
    })

    lineage = { chain, remixes: children.map((r) => r.newMeme) }
  } catch {
    if (!meme) notFound()
  }

  if (!meme) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Meme image */}
      <div className="relative w-full rounded-xl overflow-hidden bg-[#111] border border-border">
        <Image
          src={meme.imageUrl}
          alt={meme.template?.name ?? "Meme"}
          width={meme.width}
          height={meme.height}
          className="w-full h-auto"
          unoptimized
          priority
        />
      </div>

      {/* Actions row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm text-muted">
          {meme.template && (
            <span>
              Template:{" "}
              <Link href={`/create/${meme.template.id}`} className="text-foreground hover:text-accent transition-colors">
                {meme.template.name}
              </Link>
            </span>
          )}
        </div>
        <ShareButtons shortId={meme.shortId} />
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-muted/60 font-mono">
        <span>{meme.viewCount} views</span>
        <span>{meme.remixCount} remixes</span>
        <span>{new Date(meme.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Remix CTA */}
      <Link
        href={`/remix/${meme.shortId}`}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-border hover:border-accent hover:bg-accent/5 text-sm font-semibold transition-colors"
      >
        ↩ Remix this meme
      </Link>

      {/* Lineage */}
      <RemixLineage
        chain={lineage.chain}
        remixes={lineage.remixes}
        currentShortId={meme.shortId}
      />
    </div>
  )
}
