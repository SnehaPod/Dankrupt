"use client"

import { useEffect, useRef, useState } from "react"
import { useEditorStore, type TextLayer } from "@/store/editor"

export function EditorCanvas() {
  const canvasElRef  = useRef<HTMLCanvasElement>(null)
  // Outer wrapper — measured on init to compute the right canvas scale
  const containerRef = useRef<HTMLDivElement>(null)
  const fabricRef    = useRef<any>(null)
  const suppressSync = useRef(false)
  const [canvasSize, setCanvasSize] = useState<{ w: number; h: number } | null>(null)
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

    let cancelled    = false
    let canvasInstance: any = null

    ;(async () => {
      const { Canvas, Textbox, FabricImage } = await import("fabric")

      if (cancelled || !canvasElRef.current) return

      const templateW = activeTemplate?.width  ?? 800
      const templateH = activeTemplate?.height ?? 600

      // Use the wrapper's actual rendered width so the canvas fits on any screen.
      // 780 is the desktop cap; on narrow viewports the container will be smaller.
      const availW  = containerRef.current?.offsetWidth ?? 780
      const maxW    = Math.min(780, Math.max(280, availW))
      const scale   = Math.min(1, maxW / templateW)
      const w       = Math.round(templateW * scale)
      const h       = Math.round(templateH * scale)
      scaleRef.current = scale

      const canvas = new Canvas(canvasElRef.current, {
        width: w,
        height: h,
        preserveObjectStacking: true,
        selection: true,
      })
      canvasInstance = canvas

      if (cancelled) { canvas.dispose(); return }

      fabricRef.current = canvas

      setGetCanvasDataUrl((format: string) =>
        canvas.toDataURL({ format: format as any, multiplier: 2 })
      )
      setCanvasSize({ w, h })

      if (activeTemplate?.imageUrl) {
        try {
          const img = await FabricImage.fromURL(activeTemplate.imageUrl, { crossOrigin: "anonymous" })
          if (!cancelled) {
            img.set({ left: 0, top: 0, scaleX: scale, scaleY: scale,
              selectable: false, evented: false, originX: "left", originY: "top" })
            canvas.backgroundImage = img
            canvas.renderAll()
          }
        } catch { /* template image failed — proceed with blank canvas */ }
      }

      if (cancelled) return

      const snap = useEditorStore.getState()
      snap.layers.forEach((layer) => addTextbox(canvas, Textbox, layer, scale))
      canvas.renderAll()

      // ── Canvas → Store events ─────────────────────────────────────────
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
          x:      Math.round(obj.left / scale),
          y:      Math.round(obj.top  / scale),
          width:  Math.round((obj.width * obj.scaleX) / scale),
          angle:  Math.round(obj.angle ?? 0),
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
    for (const obj of canvas.getObjects() as any[]) {
      const id: string | undefined = obj?.data?.layerId
      if (!id) continue
      const layer = layers.find((l) => l.id === id)
      if (!layer) continue
      const s = scaleRef.current
      obj.set({
        text:        layer.text,
        fontSize:    layer.fontSize    * s,
        fontFamily:  layer.fontFamily,
        fill:        layer.fill,
        stroke:      layer.stroke,
        strokeWidth: layer.strokeWidth * s,
        textAlign:   layer.align,
        fontStyle:   layer.fontStyle.includes("italic") ? "italic" : "normal",
        fontWeight:  layer.fontStyle.includes("bold")   ? "bold"   : "normal",
        angle:       layer.angle ?? 0,
      })
    }
    canvas.requestRenderAll()
    suppressSync.current = false
  }, [layers])

  // Aspect ratio for the placeholder matches the template so the layout
  // doesn't jump when the canvas initialises.
  const placeholderRatio = activeTemplate
    ? `${activeTemplate.width} / ${activeTemplate.height}`
    : "4 / 3"

  return (
    // Full-width wrapper — its offsetWidth is read on init to size the canvas.
    <div ref={containerRef} className="w-full flex items-center justify-center">
      <div
        className="relative rounded-lg overflow-hidden shadow-2xl bg-[#111]"
        style={
          canvasSize
            ? { width: canvasSize.w, height: canvasSize.h }
            : { width: "100%", maxWidth: 780, aspectRatio: placeholderRatio }
        }
      >
        {!activeTemplate && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-muted/40 font-mono text-sm">Pick a template to start</p>
          </div>
        )}
        <canvas ref={canvasElRef} className="block" />
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function addTextbox(canvas: any, Textbox: any, layer: TextLayer, scale: number) {
  const obj = new Textbox(layer.text || "Text", {
    left:         layer.x      * scale,
    top:          layer.y      * scale,
    width:        layer.width  * scale,
    fontSize:     layer.fontSize * scale,
    fontFamily:   layer.fontFamily,
    fill:         layer.fill,
    stroke:       layer.stroke,
    strokeWidth:  layer.strokeWidth * scale,
    paintFirst:   "stroke",
    textAlign:    layer.align,
    fontStyle:    layer.fontStyle.includes("italic") ? "italic" : "normal",
    fontWeight:   layer.fontStyle.includes("bold")   ? "bold"   : "normal",
    angle:        layer.angle ?? 0,
    originX:      "left" as const,
    originY:      "top"  as const,
    hasControls:  true,
    lockScalingFlip: true,
    data: { layerId: layer.id },
  })
  canvas.add(obj)
  return obj
}
