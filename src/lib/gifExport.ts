"use client"

/**
 * Animated GIF export — burns text layers into every frame of a source GIF
 * and re-encodes the result using gif.js (web-worker based, browser-only).
 *
 * Architecture
 * ─────────────
 *  1. Fetch the source animated GIF (Giphy's original URL)
 *  2. Decode every frame with gifuct-js  → RGBA patch + metadata
 *  3. Composite each frame onto a persistent canvas, respecting disposal types
 *  4. Stamp text layers on top of each composited frame using Canvas 2D API
 *  5. Hand each frame to gif.js → web worker quantises & encodes
 *  6. Return the finished Blob to the caller
 */

import type { TextLayer } from "@/store/editor"

// ── gifuct-js frame shape ─────────────────────────────────────────────────────

interface GifFrame {
  patch: Uint8ClampedArray
  dims: { width: number; height: number; top: number; left: number }
  /** Frame delay already converted to milliseconds by gifuct-js */
  delay: number
  disposalType: number
  transparentIndex: number | null
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface GifExportOptions {
  /** Full-resolution animated GIF URL (Giphy original) */
  animatedUrl: string
  /** Text layers from the editor store — positions in native template space */
  layers: TextLayer[]
  /** Template native width (matches the GIF's logical screen width) */
  templateWidth: number
  /** Template native height */
  templateHeight: number
  /** Called with 0–1 as gif.js encodes frames; use for a progress indicator */
  onProgress?: (progress: number) => void
}

/**
 * Encodes an animated GIF with text burned into every frame.
 * Must be called on the client — uses DOM APIs and Web Workers.
 */
export async function encodeAnimatedGif(options: GifExportOptions): Promise<Blob> {
  const { animatedUrl, layers, templateWidth, templateHeight, onProgress } = options

  // ── 1. Load gif.js and gifuct-js (dynamic so SSR never touches them) ───────
  const [{ default: GIF }, { parseGIF, decompressFrames }] = await Promise.all([
    import("gif.js"),
    // gifuct-js is CJS; the dynamic import gives us the namespace object
    import("gifuct-js") as Promise<{
      parseGIF: (buf: ArrayBuffer) => any
      decompressFrames: (parsed: any, buildPatch: boolean) => GifFrame[]
    }>,
  ])

  // ── 2. Fetch and decode the source GIF ────────────────────────────────────
  const response = await fetch(animatedUrl, { mode: "cors" })
  if (!response.ok) throw new Error(`Failed to fetch GIF: ${response.status}`)
  const buffer = await response.arrayBuffer()

  const parsed = parseGIF(buffer)
  const frames = decompressFrames(parsed, true)
  if (!frames.length) throw new Error("GIF has no decodable frames")

  // Logical screen dimensions (the "canvas" all frames composite onto)
  const gifW: number = parsed.lsd?.width  ?? templateWidth
  const gifH: number = parsed.lsd?.height ?? templateHeight

  // ── 3. Set up offscreen canvases ──────────────────────────────────────────
  // patchCanvas: temporary canvas sized to the current frame's patch dims
  const patchCanvas = document.createElement("canvas")
  const patchCtx = patchCanvas.getContext("2d")!

  // frameCanvas: accumulates the full composite for this frame
  const frameCanvas = document.createElement("canvas")
  frameCanvas.width  = gifW
  frameCanvas.height = gifH
  const frameCtx = frameCanvas.getContext("2d")!

  // ── 4. Set up the GIF encoder ─────────────────────────────────────────────
  const gif = new GIF({
    workers:      2,
    quality:      10,
    width:        gifW,
    height:       gifH,
    // gif.worker.js must be served as a static asset from /public/
    workerScript: "/gif.worker.js",
    repeat:       -1, // loop forever
  })

  // ── 5. Process each frame ─────────────────────────────────────────────────
  let previousImageData: ImageData | null = null

  for (let i = 0; i < frames.length; i++) {
    const frame    = frames[i]
    const prevFrame = i > 0 ? frames[i - 1] : null

    // Apply the PREVIOUS frame's disposal method before drawing this frame
    if (prevFrame) {
      switch (prevFrame.disposalType) {
        case 2:
          // Restore-to-background: clear the area the previous frame occupied
          frameCtx.clearRect(
            prevFrame.dims.left,
            prevFrame.dims.top,
            prevFrame.dims.width,
            prevFrame.dims.height,
          )
          break
        case 3:
          // Restore-to-previous: revert to state before the previous frame
          if (previousImageData) frameCtx.putImageData(previousImageData, 0, 0)
          break
        // case 0 / 1 (do not dispose / leave in place): nothing to do
      }
    }

    // Save canvas state before drawing — needed for disposal type 3 next round
    if (frame.disposalType === 3) {
      previousImageData = frameCtx.getImageData(0, 0, gifW, gifH)
    }

    // Resize patch canvas to match this frame's bounding box
    if (patchCanvas.width !== frame.dims.width || patchCanvas.height !== frame.dims.height) {
      patchCanvas.width  = frame.dims.width
      patchCanvas.height = frame.dims.height
    }

    // Paint the decompressed RGBA patch onto the patch canvas then composite
    patchCtx.putImageData(
      new ImageData(new Uint8ClampedArray(frame.patch), frame.dims.width, frame.dims.height),
      0,
      0,
    )
    frameCtx.drawImage(
      patchCanvas,
      frame.dims.left,
      frame.dims.top,
      frame.dims.width,
      frame.dims.height,
    )

    // Stamp text layers on top of the composited frame
    drawTextLayers(frameCtx, layers, gifW, gifH, templateWidth, templateHeight)

    // gif.js needs a snapshot right now (canvas will be mutated next iteration)
    const delayMs = frame.delay ?? 100
    gif.addFrame(frameCanvas, { delay: delayMs, copy: true })
  }

  // ── 6. Render and return blob ─────────────────────────────────────────────
  return new Promise<Blob>((resolve, reject) => {
    if (onProgress) gif.on("progress", onProgress)
    gif.on("finished", resolve)
    gif.on("error",    reject)
    gif.render()
  })
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Render all text layers onto `ctx` using the Canvas 2D API.
 *
 * Layer coordinates are in *template* space (templateWidth × templateHeight).
 * If the actual GIF has different dimensions we scale proportionally.
 */
function drawTextLayers(
  ctx: CanvasRenderingContext2D,
  layers: TextLayer[],
  gifW: number,
  gifH: number,
  templateW: number,
  templateH: number,
) {
  // Scale factor between template coordinates and actual GIF pixels
  const sx = gifW / templateW
  const sy = gifH / templateH

  for (const layer of layers) {
    const text = layer.text?.trim()
    if (!text) continue

    ctx.save()

    const fontSize = layer.fontSize * sx // scale font size proportionally
    const parts: string[] = []
    if (layer.fontStyle?.includes("italic")) parts.push("italic")
    if (layer.fontStyle?.includes("bold"))   parts.push("bold")
    ctx.font          = `${parts.join(" ")} ${fontSize}px "${layer.fontFamily}"`
    ctx.textBaseline  = "top"
    ctx.textAlign     = layer.align

    // Apply shadow if configured
    if (layer.shadowBlur > 0) {
      ctx.shadowColor = layer.shadowColor
      ctx.shadowBlur  = layer.shadowBlur * sx
    }

    // Rotate around the centre of the text region
    const cx = (layer.x + layer.width  / 2) * sx
    const cy = (layer.y + layer.height / 2) * sy
    ctx.translate(cx, cy)
    ctx.rotate(((layer.angle ?? 0) * Math.PI) / 180)
    ctx.translate(-(layer.width / 2) * sx, -(layer.height / 2) * sy)

    const xOffset =
      layer.align === "center" ? (layer.width * sx) / 2
      : layer.align === "right"  ? layer.width * sx
      : 0

    const lineHeight = fontSize * 1.2
    let yPos = 0

    for (const line of text.split("\n")) {
      if (layer.strokeWidth > 0) {
        ctx.shadowColor  = "transparent"    // avoid double shadow on stroke
        ctx.strokeStyle  = layer.stroke
        ctx.lineWidth    = layer.strokeWidth * 2 * sx
        ctx.lineJoin     = "round"
        ctx.strokeText(line, xOffset, yPos)
        // Restore shadow for fill
        if (layer.shadowBlur > 0) ctx.shadowColor = layer.shadowColor
      }
      ctx.fillStyle = layer.fill
      ctx.fillText(line, xOffset, yPos)
      yPos += lineHeight
    }

    ctx.restore()
  }
}

/** Convert a Blob to a base64 data URL (needed to POST to the export API). */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
