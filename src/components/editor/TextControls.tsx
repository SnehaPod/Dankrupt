"use client"

import { useEditorStore } from "@/store/editor"

const FONTS = ["Impact", "Arial", "Comic Sans MS", "Georgia", "Courier New", "Helvetica"]
const ALIGNS = ["left", "center", "right"] as const

export function TextControls() {
  const { layers, selectedLayerId, updateLayer } = useEditorStore()

  const layer = layers.find((l) => l.id === selectedLayerId) ?? layers[0]

  if (!layer) {
    return (
      <p className="text-muted/50 text-xs font-mono px-1">
        No text layer selected
      </p>
    )
  }

  const isBold = layer.fontStyle.includes("bold")
  const isItalic = layer.fontStyle.includes("italic")

  function setFontStyle(bold: boolean, italic: boolean) {
    const parts = []
    if (italic) parts.push("italic")
    if (bold) parts.push("bold")
    updateLayer(layer.id, { fontStyle: parts.join(" ") || "normal" })
  }

  return (
    <div className="space-y-4 text-sm">
      {/* Text content */}
      <div className="space-y-1">
        <label className="text-muted text-xs uppercase tracking-wider">Text</label>
        <textarea
          value={layer.text}
          onChange={(e) => updateLayer(layer.id, { text: e.target.value })}
          rows={2}
          className="w-full bg-surface border border-border rounded px-2 py-1.5 text-sm resize-none focus:outline-none focus:border-accent"
        />
      </div>

      {/* Font family */}
      <div className="space-y-1">
        <label className="text-muted text-xs uppercase tracking-wider">Font</label>
        <select
          value={layer.fontFamily}
          onChange={(e) => updateLayer(layer.id, { fontFamily: e.target.value })}
          className="w-full bg-surface border border-border rounded px-2 py-1.5 focus:outline-none focus:border-accent"
        >
          {FONTS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      {/* Font size */}
      <div className="space-y-1">
        <label className="text-muted text-xs uppercase tracking-wider">
          Size — {layer.fontSize}px
        </label>
        <input
          type="range"
          min={10}
          max={120}
          value={layer.fontSize}
          onChange={(e) => updateLayer(layer.id, { fontSize: Number(e.target.value) })}
          className="w-full accent-accent"
        />
      </div>

      {/* Bold / Italic / Align */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFontStyle(!isBold, isItalic)}
          className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${
            isBold
              ? "bg-accent border-accent text-white"
              : "border-border text-muted hover:text-foreground"
          }`}
        >
          B
        </button>
        <button
          onClick={() => setFontStyle(isBold, !isItalic)}
          className={`px-3 py-1.5 rounded text-xs italic border transition-colors ${
            isItalic
              ? "bg-accent border-accent text-white"
              : "border-border text-muted hover:text-foreground"
          }`}
        >
          I
        </button>
        <div className="ml-auto flex gap-1">
          {ALIGNS.map((a) => (
            <button
              key={a}
              onClick={() => updateLayer(layer.id, { align: a })}
              title={a}
              className={`px-2 py-1.5 rounded text-xs border transition-colors ${
                layer.align === a
                  ? "bg-accent border-accent text-white"
                  : "border-border text-muted hover:text-foreground"
              }`}
            >
              {a === "left" ? "⬅" : a === "center" ? "↔" : "➡"}
            </button>
          ))}
        </div>
      </div>

      {/* Fill color */}
      <div className="flex items-center justify-between">
        <label className="text-muted text-xs uppercase tracking-wider">Fill</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={layer.fill}
            onChange={(e) => updateLayer(layer.id, { fill: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
          />
          <span className="text-xs font-mono text-muted">{layer.fill}</span>
        </div>
      </div>

      {/* Stroke color + width */}
      <div className="flex items-center justify-between">
        <label className="text-muted text-xs uppercase tracking-wider">Outline</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={layer.stroke}
            onChange={(e) => updateLayer(layer.id, { stroke: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
          />
          <input
            type="number"
            min={0}
            max={10}
            value={layer.strokeWidth}
            onChange={(e) => updateLayer(layer.id, { strokeWidth: Number(e.target.value) })}
            className="w-12 bg-surface border border-border rounded px-1.5 py-1 text-xs focus:outline-none focus:border-accent text-center"
          />
        </div>
      </div>

      {/* Rotation */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-muted text-xs uppercase tracking-wider">
            Rotate
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={-180}
              max={180}
              value={layer.angle ?? 0}
              onChange={(e) => updateLayer(layer.id, { angle: Math.max(-180, Math.min(180, Number(e.target.value))) })}
              className="w-14 bg-surface border border-border rounded px-1.5 py-1 text-xs focus:outline-none focus:border-accent text-center"
            />
            <span className="text-muted text-xs">°</span>
            {(layer.angle ?? 0) !== 0 && (
              <button
                onClick={() => updateLayer(layer.id, { angle: 0 })}
                title="Reset rotation"
                className="text-muted hover:text-foreground text-xs px-1.5 py-1 border border-border rounded transition-colors"
              >
                ↺
              </button>
            )}
          </div>
        </div>
        <input
          type="range"
          min={-180}
          max={180}
          value={layer.angle ?? 0}
          onChange={(e) => updateLayer(layer.id, { angle: Number(e.target.value) })}
          className="w-full accent-accent"
        />
      </div>

      {/* Shadow blur */}
      <div className="space-y-1">
        <label className="text-muted text-xs uppercase tracking-wider">
          Shadow — {layer.shadowBlur}
        </label>
        <input
          type="range"
          min={0}
          max={20}
          value={layer.shadowBlur}
          onChange={(e) => updateLayer(layer.id, { shadowBlur: Number(e.target.value) })}
          className="w-full accent-accent"
        />
      </div>
    </div>
  )
}
