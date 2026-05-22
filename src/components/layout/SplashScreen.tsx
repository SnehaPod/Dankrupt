"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

const MESSAGES = [
  "Filing for meme bankruptcy...",
  "Smashing the piggy bank...",
  "Loading internet culture...",
  "Consulting the meme lords...",
  "Generating dankness...",
  "Counting empty pockets...",
  "Brb going broke...",
]

/** Full-screen splash shown on initial app load. Auto-dismisses after ~2 s. */
export function SplashScreen() {
  const [visible,  setVisible]  = useState(true)
  const [fadeOut,  setFadeOut]  = useState(false)
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    // Cycle loading quips
    const msgTimer = setInterval(
      () => setMsgIndex((i) => (i + 1) % MESSAGES.length),
      750,
    )

    // Begin fade-out at 1.8 s
    const fadeTimer = setTimeout(() => setFadeOut(true), 1800)

    // Unmount after fade completes (500 ms transition)
    const removeTimer = setTimeout(() => setVisible(false), 2350)

    return () => {
      clearInterval(msgTimer)
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      className={`
        fixed inset-0 z-[9999]
        flex flex-col items-center justify-center gap-0
        bg-background
        transition-opacity duration-500 ease-in-out
        ${fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"}
      `}
    >
      {/* Purple glow behind mascot */}
      <div className="absolute w-72 h-72 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

      {/* Mascot — floating animation */}
      <div className="animate-float relative z-10">
        <Image
          src="/icon.png"
          alt="Dankrupt mascot"
          width={180}
          height={180}
          priority
          className="drop-shadow-[0_8px_32px_rgba(168,85,247,0.35)]"
        />
      </div>

      {/* Wordmark */}
      <h1
        className="
          font-[family-name:var(--font-bangers)]
          text-5xl tracking-widest gradient-text
          mt-2 select-none animate-fade-in-up
        "
      >
        DANKRUPT
      </h1>

      {/* Cycling quip */}
      <p
        key={msgIndex}
        className="
          text-muted text-xs font-mono mt-2
          animate-fade-in-up
        "
      >
        {MESSAGES[msgIndex]}
      </p>

      {/* Three bouncing dots */}
      <div className="flex items-center gap-2 mt-5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block w-2 h-2 rounded-full bg-accent animate-dot"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>
    </div>
  )
}
