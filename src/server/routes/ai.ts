import { Hono } from "hono"
import { streamText } from "hono/streaming"
import { generateCaptions, type CaptionTone } from "../lib/ai"

export const aiRouter = new Hono()

aiRouter.post("/captions", async (c) => {
  const body = await c.req.json()
  const { templateName = "meme", existingText = "", tone = "genz" } = body as {
    templateName?: string
    existingText?: string
    tone?: CaptionTone
  }

  const captions = await generateCaptions({ templateName, existingText, tone })
  return c.json({ captions })
})

aiRouter.post("/suggest-template", async (c) => {
  // Placeholder — template suggestion via semantic search (post-MVP)
  return c.json({ templates: [] })
})
