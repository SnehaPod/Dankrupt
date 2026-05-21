"use client"

import { useEditorStore } from "@/store/editor"
import { useCaptions } from "@/hooks/useCaptions"
import type { CaptionTone } from "@/types"

const TONES: { value: CaptionTone; label: string; emoji: string }[] = [
  { value: "genz", label: "Gen Z", emoji: "💀" },
  { value: "absurd", label: "Absurd", emoji: "🌀" },
  { value: "corporate", label: "Corporate", emoji: "📊" },
  { value: "sarcastic", label: "Sarcastic", emoji: "🙄" },
  { value: "cursed", label: "Cursed", emoji: "😈" },
  { value: "wholesome", label: "Wholesome", emoji: "🥹" },
]

export function AICaptionPanel() {
  const { captionTone, captions, captionsLoading, setCaptionTone, applyCaption } =
    useEditorStore()
  const { fetchCaptions } = useCaptions()

  return (
    <div className="space-y-4">
      {/* Tone selector */}
      <div className="space-y-2">
        <label className="text-muted text-xs uppercase tracking-wider">Tone</label>
        <div className="grid grid-cols-3 gap-1.5">
          {TONES.map((t) => (
            <button
              key={t.value}
              onClick={() => setCaptionTone(t.value)}
              className={`px-2 py-1.5 rounded text-xs border transition-colors text-left ${
                captionTone === t.value
                  ? "bg-accent border-accent text-white"
                  : "border-border text-muted hover:text-foreground hover:border-muted"
              }`}
            >
              <span className="mr-1">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={fetchCaptions}
        disabled={captionsLoading}
        className="w-full py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded transition-colors"
      >
        {captionsLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating…
          </span>
        ) : (
          "Suggest captions"
        )}
      </button>

      {/* Caption list */}
      {captions.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-muted text-xs uppercase tracking-wider">
            Click to apply
          </label>
          {captions.map((caption, i) => (
            <button
              key={i}
              onClick={() => applyCaption(caption)}
              className="w-full text-left px-3 py-2 rounded border border-border hover:border-accent hover:bg-accent/10 text-sm transition-colors"
            >
              {caption}
            </button>
          ))}
        </div>
      )}

      {captions.length === 0 && !captionsLoading && (
        <p className="text-muted/40 text-xs font-mono text-center py-2">
          No suggestions yet
        </p>
      )}
    </div>
  )
}
