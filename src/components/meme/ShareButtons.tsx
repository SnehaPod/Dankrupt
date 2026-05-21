"use client"

import { useState } from "react"

export function ShareButtons({ shortId }: { shortId: string }) {
  const [copied, setCopied] = useState(false)

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/m/${shortId}`
      : `/m/${shortId}`

  async function copyLink() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function shareOnX() {
    const text = encodeURIComponent("made this on dankrupt 💀")
    const shareUrl = encodeURIComponent(url)
    window.open(
      `https://x.com/intent/tweet?text=${text}&url=${shareUrl}`,
      "_blank",
      "noopener"
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={copyLink}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-xs text-muted hover:text-foreground hover:border-muted transition-colors"
      >
        {copied ? "✓ Copied" : "⎘ Copy link"}
      </button>
      <button
        onClick={shareOnX}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-xs text-muted hover:text-foreground hover:border-muted transition-colors"
      >
        𝕏 Share
      </button>
    </div>
  )
}
