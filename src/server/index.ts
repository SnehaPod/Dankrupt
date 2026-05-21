import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { templatesRouter } from "./routes/templates"
import { memesRouter } from "./routes/memes"
import { aiRouter } from "./routes/ai"
import { exportRouter } from "./routes/export"

const app = new Hono().basePath("/api")

app.use("*", cors())
app.use("*", logger())

app.route("/templates", templatesRouter)
app.route("/memes", memesRouter)
app.route("/ai", aiRouter)
app.route("/export", exportRouter)

app.get("/health", (c) => c.json({ ok: true }))

export { app }
export type AppType = typeof app
