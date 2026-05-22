"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useEditorStore } from "@/store/editor"
import { encodeAnimatedGif, blobToDataUrl } from "@/lib/gifExport"
import { ShareModal } from "./ShareModal"
import type { ExportFormat } from "@/types"

const STATIC_FORMATS: ExportFormat[] = ["png", "jpeg"]

export function EditorToolbar() {
  const {
    activeTemplate,
    sourceMemeId,
    layers,
    addLayer,
    removeLayer,
    selectedLayerId,
    history,
    historyIndex,
    undo,
    redo,
    exportFormat,
    setExportFormat,
    exportLoading,
    setExportLoading,
    getCanvasDataUrl,
  } = useEditorStore()

  // 0–1 while gif.js is quantising frames, null otherwise
  const [gifProgress, setGifProgress] = useState<number | null>(null)
  // shortId of the just-uploaded meme — drives the share modal
  const [shareShortId, setShareShortId] = useState<string | null>(null)

  // ── Derived ───────────────────────────────────────────────────────────────
  /** Whether the active template is an animated GIF with an exportable source */
  const isGifTemplate = !!activeTemplate?.originalGifUrl
  /** Formats to show in the picker — GIF option only visible for GIF templates */
  const availableFormats: ExportFormat[] = isGifTemplate
    ? [...STATIC_FORMATS, "gif"]
    : STATIC_FORMATS

  const isGifExport    = exportFormat === "gif" && isGifTemplate
  const isEncoding     = gifProgress !== null
  const isBusy         = isEncoding || exportLoading

  // Reset to PNG when switching away from a GIF template
  useEffect(() => {
    if (exportFormat === "gif" && !isGifTemplate) setExportFormat("png")
  }, [isGifTemplate, exportFormat, setExportFormat])

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey
      if (!meta) return
      if (e.key === "z" && !e.shiftKey) { e.preventDefault(); undo() }
      if (e.key === "z" &&  e.shiftKey) { e.preventDefault(); redo() }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [undo, redo])

  // ── Helpers ───────────────────────────────────────────────────────────────

  function handleAddText() {
    addLayer({
      id: crypto.randomUUID(),
      text: "Add text",
      x: 50, y: 50,
      width: 300, height: 60,
      fontSize: 36,
      fontFamily: "Impact",
      fill: "#ffffff",
      stroke: "#000000",
      strokeWidth: 2,
      shadowColor: "rgba(0,0,0,0.6)",
      shadowBlur: 4,
      align: "center",
      fontStyle: "normal",
      angle: 0,
    })
  }

  /** Returns a data URL for the meme — handles both static and animated exports. */
  async function buildDataUrl(): Promise<string | null> {
    if (isGifExport) {
      setGifProgress(0)
      try {
        const blob = await encodeAnimatedGif({
          animatedUrl:    activeTemplate!.originalGifUrl!,
          layers,
          templateWidth:  activeTemplate!.width,
          templateHeight: activeTemplate!.height,
          onProgress:     setGifProgress,
        })
        setGifProgress(null)
        return blobToDataUrl(blob)
      } catch (err) {
        console.error("[gifExport] encoding failed:", err)
        setGifProgress(null)
        return null
      }
    }

    // Static format (PNG / JPEG)
    if (!getCanvasDataUrl) return null
    return getCanvasDataUrl(exportFormat)
  }

  // ── Download (local, no server) ───────────────────────────────────────────
  async function handleDownload() {
    if (isGifExport) {
      // For GIF, encode first then hand the Blob straight to the browser
      setGifProgress(0)
      try {
        const blob = await encodeAnimatedGif({
          animatedUrl:    activeTemplate!.originalGifUrl!,
          layers,
          templateWidth:  activeTemplate!.width,
          templateHeight: activeTemplate!.height,
          onProgress:     setGifProgress,
        })
        const url = URL.createObjectURL(blob)
        const a   = document.createElement("a")
        a.href     = url
        a.download = "dankrupt-meme.gif"
        a.click()
        URL.revokeObjectURL(url)
      } catch (err) {
        console.error("[gifExport] download failed:", err)
      } finally {
        setGifProgress(null)
      }
      return
    }

    if (!getCanvasDataUrl) return
    const dataUrl = getCanvasDataUrl(exportFormat)
    const a = document.createElement("a")
    a.href     = dataUrl
    a.download = `dankrupt-meme.${exportFormat}`
    a.click()
  }

  // ── Export / Share (upload → permalink) ──────────────────────────────────
  async function handleExport() {
    const dataUrl = await buildDataUrl()
    if (!dataUrl) return

    setExportLoading(true)
    try {
      const res = await fetch("/api/export", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageDataUrl: dataUrl,
          format:       exportFormat,
          templateId:   activeTemplate?.id ?? null,
          canvasState:  { layers },
          width:        activeTemplate?.width  ?? 800,
          height:       activeTemplate?.height ?? 600,
          sourceMemeId: sourceMemeId ?? null,
        }),
      })
      if (!res.ok) throw new Error("Export failed")
      const { shortId } = await res.json()
      // Open the share modal instead of navigating away
      setShareShortId(shortId)
    } catch {
      // Fallback: trigger local download if the server upload fails
      const a = document.createElement("a")
      a.href     = dataUrl
      a.download = `dankrupt-meme.${exportFormat}`
      a.click()
    } finally {
      setExportLoading(false)
    }
  }

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  // ── Labels ────────────────────────────────────────────────────────────────
  const progressLabel = isEncoding
    ? `🎬 ${Math.round(gifProgress! * 100)}%`
    : null

  return (
    <>
    {/* ── Share modal (portal-like: sits above the editor, outside the toolbar) */}
    {shareShortId && (
      <ShareModal
        shortId={shareShortId}
        onClose={() => setShareShortId(null)}
        onDownload={handleDownload}
      />
    )}

    {/* overflow-x-auto + [scrollbar-width:none] lets the toolbar scroll on narrow
        screens without a visible scrollbar — all buttons stay reachable. */}
    <div className="h-11 border-b border-border flex items-center gap-2 px-3 shrink-0 overflow-x-auto [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
      <div className="flex items-center gap-2 min-w-max w-full">
      {/* Undo / Redo */}
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo (⌘Z)"
          className="p-1.5 rounded text-muted hover:text-foreground hover:bg-surface-elevated disabled:opacity-30 transition-colors text-sm"
        >
          ↩
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo (⌘⇧Z)"
          className="p-1.5 rounded text-muted hover:text-foreground hover:bg-surface-elevated disabled:opacity-30 transition-colors text-sm"
        >
          ↪
        </button>
      </div>

      {/* Delete selected layer */}
      <button
        onClick={() => selectedLayerId && removeLayer(selectedLayerId)}
        disabled={!selectedLayerId}
        title="Delete selected text layer"
        className="p-1.5 rounded text-muted hover:text-red-400 hover:bg-red-500/10 disabled:opacity-25 transition-colors"
        aria-label="Delete layer"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2.5 3.5h9M5.5 3.5V2.5h3v1M6 6v4M8 6v4M3.5 3.5l.75 7.5h5.5l.75-7.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Browse templates */}
      <Link
        href="/trending"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border border-border text-muted hover:text-foreground hover:border-muted transition-colors"
      >
        ☰ Templates
      </Link>

      {/* Add text */}
      <button
        onClick={handleAddText}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border border-border text-muted hover:text-foreground hover:border-muted transition-colors"
      >
        <span className="text-base leading-none">T</span>
        <span>Add text</span>
      </button>

      {/* Spacer + active template name */}
      <div className="flex-1 flex items-center justify-center">
        {activeTemplate && (
          <span className="text-xs text-muted/50 font-mono truncate max-w-48">
            {activeTemplate.name}
          </span>
        )}
      </div>

      {/* GIF encoding progress bar (only visible while encoding) */}
      {isEncoding && (
        <div className="flex items-center gap-2 text-xs text-accent font-mono">
          <div className="w-20 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-150"
              style={{ width: `${Math.round(gifProgress! * 100)}%` }}
            />
          </div>
          <span className="tabular-nums">{Math.round(gifProgress! * 100)}%</span>
        </div>
      )}

      {/* Export format selector */}
      <select
        value={exportFormat}
        onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
        disabled={isBusy}
        className="bg-surface border border-border rounded px-2 py-1 text-xs focus:outline-none focus:border-accent uppercase disabled:opacity-40"
      >
        {availableFormats.map((f) => (
          <option key={f} value={f}>
            {f.toUpperCase()}{f === "gif" ? " ✦" : ""}
          </option>
        ))}
      </select>

      {/* Download — always saves locally, no server required */}
      <button
        onClick={handleDownload}
        disabled={isBusy || (!getCanvasDataUrl && !isGifTemplate)}
        title={isGifExport ? "Encode & save animated GIF" : "Save to device"}
        className="flex items-center gap-1.5 px-3 py-1.5 border border-border hover:border-accent hover:text-accent disabled:opacity-30 text-muted text-xs font-semibold rounded transition-colors"
      >
        {progressLabel ?? "↓ Save"}
      </button>

      {/* Share — uploads and creates a shareable permalink */}
      <button
        onClick={handleExport}
        disabled={isBusy}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-xs font-bold rounded transition-colors"
      >
        {exportLoading ? (
          <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : isEncoding ? (
          <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          "↗"
        )}
        Share
      </button>
      </div>{/* min-w-max inner wrapper */}
    </div>
    </>
  )
}
