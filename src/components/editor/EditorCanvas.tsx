"use client"

import { useEffect, useRef, useState } from "react"
import { useEditorStore, type TextLayer } from "@/store/editor"

const MAX_WIDTH = 780

export function EditorCanvas() {
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  // typed as any to avoid importing fabric types at module level (SSR safe)
  const fabricRef = useRef<any>(null)
  // Prevents infinite loop: canvas event → store → sync effect → canvas event
  const suppressSync = useRef(false)
  // Tracks canvas render size so the container div is always exactly that size
  // (prevents flex-shrink from collapsing the div and clipping canvas content)
  const [canvasSize, setCanvasSize] = useState<{ w: number; h: number } | null>(null)
  // Scale factor (canvas px / template px) — shared with sync effect via ref
  const scaleRef = useRef(1)

  const {
    activeTemplate,
    layers,
    updateLayer,
    selectLayer,
    pushHistory,
    setGetCanvasDataUrl,
  } = useEditorStore()

  // ── Initialize canvas (once on mount) ────────────────────────────────────
  useEffect(() => {
    if (!canvasElRef.current) return

    // `cancelled` lets the async body bail out if cleanup fires before it finishes.
    // `canvasInstance` gives cleanup a direct handle even if fabricRef wasn't set yet.
    let cancelled = false
    let canvasInstance: any = null

    ;(async () => {
      const { Canvas, Textbox, FabricImage } = await import("fabric")

      // StrictMode may have already unmounted by the time the import resolves
      if (cancelled || !canvasElRef.current) return

      const templateW = activeTemplate?.width ?? 800
      const templateH = activeTemplate?.height ?? 600
      const scale = Math.min(1, MAX_WIDTH / templateW)
      const w = Math.round(templateW * scale)
      const h = Math.round(templateH * scale)
      scaleRef.current = scale

      const canvas = new Canvas(canvasElRef.current, {
        width: w,
        height: h,
        preserveObjectStacking: true,
        selection: true,
      })
      canvasInstance = canvas

      // Cleanup may have fired between the import and the Canvas constructor
      if (cancelled) {
        canvas.dispose()
        return
      }

      fabricRef.current = canvas

      // Register export function in store
      setGetCanvasDataUrl((format: string) =>
        canvas.toDataURL({ format: format as any, multiplier: 2 })
      )
      // Size the container div to exactly match the canvas so overflow-hidden
      // only clips at the true canvas boundary (not at a shrunken flex item).
      setCanvasSize({ w, h })

      // Load background image
      if (activeTemplate?.imageUrl) {
        try {
          const img = await FabricImage.fromURL(activeTemplate.imageUrl, {
            crossOrigin: "anonymous",
          })
          if (!cancelled) {
            img.set({
              left: 0, top: 0,
              scaleX: scale, scaleY: scale,
              selectable: false, evented: false,
              originX: "left", originY: "top",
            })
            canvas.backgroundImage = img
            canvas.renderAll()
          }
        } catch {
          // template image failed — proceed with blank canvas
        }
      }

      if (cancelled) return

      // Add initial text layers
      const snap = useEditorStore.getState()
      snap.layers.forEach((layer) => addTextbox(canvas, Textbox, layer, scale))

      canvas.renderAll()

      // ── Canvas → Store events ──────────────────────────────────────────
      canvas.on("selection:created", (e: any) => {
        const id = e.selected?.[0]?.data?.layerId
        if (id) selectLayer(id)
      })

      canvas.on("selection:updated", (e: any) => {
        const id = e.selected?.[0]?.data?.layerId
        if (id) selectLayer(id)
      })

      canvas.on("selection:cleared", () => selectLayer(null))

      canvas.on("object:modified", (e: any) => {
        if (suppressSync.current) return
        const obj = e.target
        const id: string | undefined = obj?.data?.layerId
        if (!id) return
        updateLayer(id, {
          x: Math.round(obj.left / scale),
          y: Math.round(obj.top / scale),
          width: Math.round((obj.width * obj.scaleX) / scale),
          angle: Math.round(obj.angle ?? 0),
        })
        pushHistory({ json: (canvas as any).toJSON(["data"]), timestamp: Date.now() })
      })

      canvas.on("text:changed", (e: any) => {
        if (suppressSync.current) return
        const obj = e.target
        const id: string | undefined = obj?.data?.layerId
        if (!id) return
        updateLayer(id, { text: obj.text })
      })
    })()

    return () => {
      cancelled = true
      canvasInstance?.dispose()
      fabricRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Store layers → Canvas sync ────────────────────────────────────────────
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    suppressSync.current = true

    const objects: any[] = canvas.getObjects()
    for (const obj of objects) {
      const id: string | undefined = obj?.data?.layerId
      if (!id) continue
      const layer = layers.find((l) => l.id === id)
      if (!layer) continue

      const s = scaleRef.current
      obj.set({
        text: layer.text,
        fontSize: layer.fontSize * s,
        fontFamily: layer.fontFamily,
        fill: layer.fill,
        stroke: layer.stroke,
        strokeWidth: layer.strokeWidth * s,
        textAlign: layer.align,
        fontStyle: layer.fontStyle.includes("italic") ? "italic" : "normal",
        fontWeight: layer.fontStyle.includes("bold") ? "bold" : "normal",
        angle: layer.angle ?? 0,
      })
    }

    canvas.requestRenderAll()
    suppressSync.current = false
  }, [layers])

  return (
    // The container is sized to exactly match the canvas element so that
    // overflow-hidden (needed for rounded corners) never clips canvas content.
    // Before the canvas initialises, we show a placeholder at a default size.
    <div
      className={`relative rounded-lg overflow-hidden shadow-2xl bg-[#111]${
        !canvasSize ? " flex items-center justify-center" : ""
      }`}
      style={
        canvasSize
          ? { width: canvasSize.w, height: canvasSize.h }
          : { minWidth: 480, minHeight: 320 }
      }
    >
      {!activeTemplate && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-muted/40 font-mono text-sm">
            Pick a template to start
          </p>
        </div>
      )}
      <canvas ref={canvasElRef} className="block" />
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function addTextbox(canvas: any, Textbox: any, layer: TextLayer, scale: number) {
  const obj = new Textbox(layer.text || "Text", {
    left: layer.x * scale,
    top: layer.y * scale,
    width: layer.width * scale,
    fontSize: layer.fontSize * scale,
    fontFamily: layer.fontFamily,
    fill: layer.fill,
    stroke: layer.stroke,
    strokeWidth: layer.strokeWidth * scale,
    paintFirst: "stroke",
    textAlign: layer.align,
    fontStyle: layer.fontStyle.includes("italic") ? "italic" : "normal",
    fontWeight: layer.fontStyle.includes("bold") ? "bold" : "normal",
    angle: layer.angle ?? 0,
    // Fabric v7 defaults originX/originY to CENTER. Override to LEFT/TOP so
    // that `left` and `top` refer to the top-left corner, matching how we
    // compute positions from template coordinates.
    originX: "left" as const,
    originY: "top" as const,
    hasControls: true,
    lockScalingFlip: true,
    data: { layerId: layer.id },
  })
  canvas.add(obj)
  return obj
}
