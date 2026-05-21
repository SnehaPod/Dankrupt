"use client"

import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import type { TemplateFull, CaptionTone, ExportFormat } from "@/types"

export interface TextLayer {
  id: string
  text: string
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  fontFamily: string
  fill: string
  stroke: string
  strokeWidth: number
  shadowColor: string
  shadowBlur: number
  align: "left" | "center" | "right"
  fontStyle: string
  /** Rotation in degrees (0 = upright). Optional so old saved memes load safely. */
  angle?: number
}

export interface CanvasSnapshot {
  json: object
  timestamp: number
}

interface EditorState {
  // Template & remix context
  activeTemplate: TemplateFull | null
  sourceMemeId: string | null

  // Layers
  layers: TextLayer[]
  selectedLayerId: string | null

  // History (undo/redo)
  history: CanvasSnapshot[]
  historyIndex: number

  // AI captions
  captionTone: CaptionTone
  captions: string[]
  captionsLoading: boolean

  // Export
  exportFormat: ExportFormat
  exportLoading: boolean
  exportedUrl: string | null

  // Canvas ref (function registered by EditorCanvas on mount)
  getCanvasDataUrl: ((format: string) => string) | null
}

interface EditorActions {
  setTemplate: (template: TemplateFull) => void
  // Load a saved meme state — keeps exact layers rather than resetting to template defaults
  loadMemeState: (template: TemplateFull | null, layers: TextLayer[], sourceMemeId?: string) => void
  setRemixSource: (memeId: string) => void

  addLayer: (layer: TextLayer) => void
  updateLayer: (id: string, patch: Partial<TextLayer>) => void
  removeLayer: (id: string) => void
  selectLayer: (id: string | null) => void
  reorderLayers: (ids: string[]) => void

  pushHistory: (snapshot: CanvasSnapshot) => void
  undo: () => CanvasSnapshot | null
  redo: () => CanvasSnapshot | null

  setCaptionTone: (tone: CaptionTone) => void
  setCaptions: (captions: string[]) => void
  setCaptionsLoading: (loading: boolean) => void
  applyCaption: (caption: string) => void

  setExportFormat: (format: ExportFormat) => void
  setExportLoading: (loading: boolean) => void
  setExportedUrl: (url: string | null) => void

  setGetCanvasDataUrl: (fn: (format: string) => string) => void

  reset: () => void
}

const defaultState: EditorState = {
  activeTemplate: null,
  sourceMemeId: null,
  layers: [],
  selectedLayerId: null,
  history: [],
  historyIndex: -1,
  captionTone: "genz",
  captions: [],
  captionsLoading: false,
  exportFormat: "png",
  exportLoading: false,
  exportedUrl: null,
  getCanvasDataUrl: null,
}

export const useEditorStore = create<EditorState & EditorActions>()(
  immer((set, get) => ({
    ...defaultState,

    setTemplate: (template) =>
      set((s) => {
        s.activeTemplate = template
        s.layers = template.textRegions.map((r) => ({
          id: r.id,
          text: r.defaultText,
          x: r.x,
          y: r.y,
          width: r.w,
          height: r.h,
          fontSize: r.fontSize,
          fontFamily: "Impact",
          fill: "#ffffff",
          stroke: "#000000",
          strokeWidth: 2,
          shadowColor: "rgba(0,0,0,0.6)",
          shadowBlur: 4,
          align: r.align,
          fontStyle: "normal",
          angle: 0,
        }))
      }),

    loadMemeState: (template, layers, sourceMemeId) =>
      set((s) => {
        s.activeTemplate = template
        s.layers = layers
        if (sourceMemeId) s.sourceMemeId = sourceMemeId
        s.history = []
        s.historyIndex = -1
      }),

    setRemixSource: (memeId) => set((s) => { s.sourceMemeId = memeId }),

    addLayer: (layer) => set((s) => { s.layers.push(layer) }),

    updateLayer: (id, patch) =>
      set((s) => {
        const layer = s.layers.find((l) => l.id === id)
        if (layer) Object.assign(layer, patch)
      }),

    removeLayer: (id) =>
      set((s) => {
        s.layers = s.layers.filter((l) => l.id !== id)
        if (s.selectedLayerId === id) s.selectedLayerId = null
      }),

    selectLayer: (id) => set((s) => { s.selectedLayerId = id }),

    reorderLayers: (ids) =>
      set((s) => {
        s.layers = ids
          .map((id) => s.layers.find((l) => l.id === id))
          .filter(Boolean) as TextLayer[]
      }),

    pushHistory: (snapshot) =>
      set((s) => {
        // Drop any redo history ahead of current index
        s.history = s.history.slice(0, s.historyIndex + 1)
        s.history.push(snapshot)
        // Cap at 50 states
        if (s.history.length > 50) s.history.shift()
        s.historyIndex = s.history.length - 1
      }),

    undo: () => {
      const { historyIndex, history } = get()
      if (historyIndex <= 0) return null
      set((s) => { s.historyIndex -= 1 })
      return history[historyIndex - 1]
    },

    redo: () => {
      const { historyIndex, history } = get()
      if (historyIndex >= history.length - 1) return null
      set((s) => { s.historyIndex += 1 })
      return history[historyIndex + 1]
    },

    setCaptionTone: (tone) => set((s) => { s.captionTone = tone }),
    setCaptions: (captions) => set((s) => { s.captions = captions }),
    setCaptionsLoading: (loading) => set((s) => { s.captionsLoading = loading }),

    applyCaption: (caption) =>
      set((s) => {
        const selected = s.layers.find((l) => l.id === s.selectedLayerId) ?? s.layers[0]
        if (selected) selected.text = caption
      }),

    setExportFormat: (format) => set((s) => { s.exportFormat = format }),
    setExportLoading: (loading) => set((s) => { s.exportLoading = loading }),
    setExportedUrl: (url) => set((s) => { s.exportedUrl = url }),

    setGetCanvasDataUrl: (fn) => set((s) => { s.getCanvasDataUrl = fn }),

    reset: () => set(() => ({ ...defaultState })),
  }))
)
