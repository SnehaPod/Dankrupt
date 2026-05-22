"use client"

import { useState } from "react"
import Link from "next/link"

interface Props {
  shortId: string
  onClose: () => void
  onDownload: () => void
}

export function ShareModal({ shortId, onClose, onDownload }: Props) {
  const [copied, setCopied] = useState(false)

  // Build the absolute URL on the client so it works across all environments
  const shareUrl  = `${window.location.origin}/m/${shortId}`
  const encUrl    = encodeURIComponent(shareUrl)
  const encText   = encodeURIComponent("Check out this meme I made on Dankrupt 🤣")

  const platforms = [
    {
      name:  "X",
      label: "X / Twitter",
      href:  `https://x.com/intent/tweet?text=${encText}&url=${encUrl}`,
      color: "hover:bg-zinc-800 hover:border-zinc-600",
      icon:  (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name:  "Reddit",
      label: "Reddit",
      href:  `https://reddit.com/submit?url=${encUrl}&title=${encText}`,
      color: "hover:bg-orange-500/10 hover:border-orange-500/40",
      icon:  (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-orange-400">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
      ),
    },
    {
      name:  "WhatsApp",
      label: "WhatsApp",
      href:  `https://api.whatsapp.com/send?text=${encText}+${encUrl}`,
      color: "hover:bg-green-500/10 hover:border-green-500/40",
      icon:  (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-400">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
        </svg>
      ),
    },
    {
      name:  "Telegram",
      label: "Telegram",
      href:  `https://t.me/share/url?url=${encUrl}&text=${encText}`,
      color: "hover:bg-sky-500/10 hover:border-sky-500/40",
      icon:  (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-sky-400">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
    },
    {
      name:  "Facebook",
      label: "Facebook",
      href:  `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`,
      color: "hover:bg-blue-600/10 hover:border-blue-600/40",
      icon:  (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-400">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
  ]

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      // Clipboard API not available — select the text as fallback
      const el = document.getElementById("share-url-display")
      if (el) {
        const range = document.createRange()
        range.selectNodeContents(el)
        window.getSelection()?.removeAllRanges()
        window.getSelection()?.addRange(range)
      }
    })
  }

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share your meme"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none"
      >
        <div className="
          bg-surface border border-border/80
          rounded-t-2xl sm:rounded-2xl
          shadow-2xl shadow-black/60
          w-full sm:max-w-[26rem]
          pointer-events-auto
          animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200
        ">

          {/* Header */}
          <div className="flex items-start justify-between px-5 pt-5 pb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">Share your meme ✦</h2>
              <p className="text-xs text-muted mt-0.5">Your meme is live — spread it far and wide</p>
            </div>
            <button
              onClick={onClose}
              className="text-muted hover:text-foreground transition-colors p-1.5 -mt-1 -mr-1 rounded-lg hover:bg-surface-elevated"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Copy link */}
          <div className="px-5 pb-4">
            <div className="flex items-center gap-2 p-1 pl-3 bg-surface-elevated border border-border/60 rounded-xl">
              <span
                id="share-url-display"
                className="flex-1 text-xs font-mono text-muted/80 truncate select-all"
              >
                {shareUrl}
              </span>
              <button
                onClick={copyLink}
                className={`
                  shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                  ${copied
                    ? "bg-green-500/20 border border-green-500/40 text-green-400"
                    : "bg-surface border border-border/60 text-muted hover:text-foreground hover:border-accent/50 hover:bg-surface"}
                `}
              >
                {copied ? "✓ Copied!" : "Copy link"}
              </button>
            </div>
          </div>

          {/* Share to platforms */}
          <div className="px-5 pb-5">
            <p className="text-[10px] text-muted/50 uppercase tracking-widest font-mono mb-3">
              Share to
            </p>
            <div className="grid grid-cols-5 gap-2">
              {platforms.map(({ name, label, href, color, icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  className={`
                    group flex flex-col items-center gap-1.5
                    p-2.5 rounded-xl border border-border/60
                    transition-all duration-150
                    ${color}
                  `}
                >
                  <span className="text-muted group-hover:text-foreground transition-colors">
                    {icon}
                  </span>
                  <span className="text-[9px] font-medium text-muted/60 group-hover:text-muted transition-colors">
                    {name}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Footer — divider then view / download */}
          <div className="px-5 pb-5 pt-4 border-t border-border/40 flex items-center gap-2">
            <Link
              href={`/m/${shortId}`}
              target="_blank"
              className="
                flex-1 text-center text-xs font-semibold py-2.5 rounded-xl
                border border-border/60 text-muted
                hover:text-foreground hover:border-accent/50 hover:bg-surface-elevated
                transition-all duration-150
              "
            >
              View meme page ↗
            </Link>
            <button
              onClick={() => { onDownload(); onClose() }}
              className="
                flex-1 text-center text-xs font-semibold py-2.5 rounded-xl
                border border-border/60 text-muted
                hover:text-foreground hover:bg-surface-elevated
                transition-all duration-150
              "
            >
              ↓ Download
            </button>
          </div>

        </div>
      </div>
    </>
  )
}
