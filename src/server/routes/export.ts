import { Hono } from "hono"
import { cloudinary } from "../lib/cloudinary"
import { db } from "../db/client"

export const exportRouter = new Hono()

const cloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
)

exportRouter.post("/", async (c) => {
  const body = await c.req.json()
  const {
    imageDataUrl,
    format = "png",
    templateId,
    canvasState,
    width,
    height,
    sourceMemeId,  // set when remixing an existing meme
  } = body

  if (!imageDataUrl || !canvasState) {
    return c.json({ error: "Missing imageDataUrl or canvasState" }, 400)
  }

  // Upload to Cloudinary, or use data URL in dev
  let imageUrl: string
  let imageWidth = width ?? 800
  let imageHeight = height ?? 600

  if (cloudinaryConfigured) {
    const result = await cloudinary.uploader.upload(imageDataUrl, {
      folder: "dankrupt/memes",
      format,
      transformation: format === "jpeg" ? [{ quality: "auto:good" }] : undefined,
    })
    imageUrl = result.secure_url
    imageWidth = result.width
    imageHeight = result.height
  } else {
    // Dev fallback: persist the data URL directly (fine for local testing)
    imageUrl = imageDataUrl
    console.warn("[export] Cloudinary not configured — storing data URL in DB (dev only)")
  }

  // Persist meme record
  const meme = await db.meme.create({
    data: {
      templateId: templateId ?? null,
      imageUrl,
      canvasState,
      width: imageWidth,
      height: imageHeight,
      isPublic: true,
    },
  })

  // Wire remix lineage
  if (sourceMemeId) {
    const source = await db.meme.findUnique({ where: { shortId: sourceMemeId } })
    if (source) {
      await db.remix.create({
        data: {
          sourceMemeId: source.id,
          newMemeId: meme.id,
        },
      }).catch(() => null)

      db.meme
        .update({ where: { id: source.id }, data: { remixCount: { increment: 1 } } })
        .catch(() => null)
    }
  }

  if (templateId) {
    db.template
      .update({ where: { id: templateId }, data: { usageCount: { increment: 1 } } })
      .catch(() => null)
  }

  return c.json({ imageUrl, shortId: meme.shortId }, 201)
})
