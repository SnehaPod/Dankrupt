"use client"

import { useEditorStore } from "@/store/editor"

export function useCaptions() {
  const {
    activeTemplate,
    layers,
    selectedLayerId,
    captionTone,
    setCaptions,
    setCaptionsLoading,
  } = useEditorStore()

  async function fetchCaptions() {
    setCaptionsLoading(true)
    try {
      const selectedLayer = layers.find((l) => l.id === selectedLayerId) ?? layers[0]
      const res = await fetch("/api/ai/captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateName: activeTemplate?.name ?? "meme",
          existingText: selectedLayer?.text ?? "",
          tone: captionTone,
        }),
      })
      const data = await res.json()
      setCaptions(data.captions ?? [])
    } catch {
      setCaptions([])
    } finally {
      setCaptionsLoading(false)
    }
  }

  return { fetchCaptions }
}
