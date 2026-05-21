import { Hono } from "hono"
import { db } from "../db/client"
import { redis } from "../lib/redis"
import type { TemplateCategory, TrendLabel } from "@prisma/client"

const TRENDING_CACHE_KEY = "templates:trending"
const TRENDING_TTL = 300 // 5 minutes

export const templatesRouter = new Hono()

templatesRouter.get("/", async (c) => {
  const { category, label, q, limit = "24", cursor } = c.req.query()

  const take = Math.min(Number(limit), 48)

  const templates = await db.template.findMany({
    where: {
      isPublic: true,
      ...(category && { category: category as TemplateCategory }),
      ...(label && { trendLabel: label as TrendLabel }),
      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { tags: { has: q.toLowerCase() } },
        ],
      }),
    },
    orderBy: { trendScore: "desc" },
    take,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    select: {
      id: true,
      slug: true,
      name: true,
      imageUrl: true,
      width: true,
      height: true,
      category: true,
      trendLabel: true,
      trendScore: true,
      tags: true,
      usageCount: true,
    },
  })

  const nextCursor =
    templates.length === take ? templates[templates.length - 1].id : null

  return c.json({ templates, nextCursor })
})

templatesRouter.get("/trending", async (c) => {
  const cached = await redis.get(TRENDING_CACHE_KEY).catch(() => null)
  if (cached) return c.json(JSON.parse(cached))

  const templates = await db.template.findMany({
    where: { isPublic: true, trendLabel: { in: ["HOT", "RISING"] } },
    orderBy: { trendScore: "desc" },
    take: 20,
    select: {
      id: true,
      slug: true,
      name: true,
      imageUrl: true,
      width: true,
      height: true,
      category: true,
      trendLabel: true,
      trendScore: true,
      tags: true,
    },
  })

  await redis.setex(TRENDING_CACHE_KEY, TRENDING_TTL, JSON.stringify({ templates })).catch(() => null)
  return c.json({ templates })
})

templatesRouter.get("/:id", async (c) => {
  const id = c.req.param("id")

  const template = await db.template.findFirst({
    where: { OR: [{ id }, { slug: id }], isPublic: true },
  })

  if (!template) return c.json({ error: "Not found" }, 404)
  return c.json({ template })
})
