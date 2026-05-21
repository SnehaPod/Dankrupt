import { Hono } from "hono"
import { db } from "../db/client"

export const memesRouter = new Hono()

memesRouter.get("/:shortId", async (c) => {
  const shortId = c.req.param("shortId")

  const meme = await db.meme.findUnique({
    where: { shortId },
    include: {
      author: { select: { username: true, displayName: true, avatarUrl: true } },
      template: { select: { id: true, name: true, slug: true } },
    },
  })

  if (!meme) return c.json({ error: "Not found" }, 404)

  // Fire-and-forget view count increment
  db.meme.update({ where: { shortId }, data: { viewCount: { increment: 1 } } }).catch(() => null)

  return c.json({ meme })
})

memesRouter.post("/", async (c) => {
  const body = await c.req.json()
  const { authorId, templateId, imageUrl, canvasState, width, height, isPublic = true } = body

  if (!imageUrl || !canvasState || !width || !height) {
    return c.json({ error: "Missing required fields" }, 400)
  }

  const meme = await db.meme.create({
    data: { authorId, templateId, imageUrl, canvasState, width, height, isPublic },
  })

  if (templateId) {
    db.template.update({
      where: { id: templateId },
      data: { usageCount: { increment: 1 } },
    }).catch(() => null)
  }

  return c.json({ meme }, 201)
})

memesRouter.post("/:shortId/remix", async (c) => {
  const shortId = c.req.param("shortId")
  const body = await c.req.json()
  const { authorId, imageUrl, canvasState, width, height } = body

  const source = await db.meme.findUnique({ where: { shortId } })
  if (!source) return c.json({ error: "Source meme not found" }, 404)

  const newMeme = await db.meme.create({
    data: {
      authorId,
      templateId: source.templateId,
      imageUrl,
      canvasState,
      width,
      height,
      isPublic: true,
    },
  })

  const remix = await db.remix.create({
    data: {
      sourceMemeId: source.id,
      newMemeId: newMeme.id,
      authorId: authorId ?? "anonymous",
    },
  })

  db.meme.update({ where: { id: source.id }, data: { remixCount: { increment: 1 } } }).catch(() => null)

  return c.json({ meme: newMeme, remix }, 201)
})

memesRouter.get("/:shortId/lineage", async (c) => {
  const shortId = c.req.param("shortId")

  const meme = await db.meme.findUnique({ where: { shortId }, select: { id: true } })
  if (!meme) return c.json({ error: "Not found" }, 404)

  // Walk up the remix chain
  const chain: { shortId: string; imageUrl: string }[] = []
  let currentId: string | null = meme.id

  while (currentId) {
    const current: { shortId: string; imageUrl: string; remixOf: { sourceMemeId: string } | null } | null =
      await db.meme.findUnique({
        where: { id: currentId },
        select: { shortId: true, imageUrl: true, remixOf: { select: { sourceMemeId: true } } },
      })
    if (!current) break
    chain.unshift({ shortId: current.shortId, imageUrl: current.imageUrl })
    currentId = current.remixOf?.sourceMemeId ?? null
  }

  const remixes = await db.remix.findMany({
    where: { sourceMemeId: meme.id },
    include: { newMeme: { select: { shortId: true, imageUrl: true } } },
    take: 12,
    orderBy: { createdAt: "desc" },
  })

  return c.json({ chain, remixes: remixes.map((r: { newMeme: { shortId: string; imageUrl: string } }) => r.newMeme) })
})
