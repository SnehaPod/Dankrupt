import Image from "next/image"

/**
 * Shown by Next.js automatically while any page inside (app) is loading
 * (Suspense boundary / route transition).  No client-side timer needed here —
 * Next.js unmounts it as soon as the page is ready.
 */
export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-0 min-h-[60vh]">
      {/* Purple glow */}
      <div className="absolute w-56 h-56 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

      {/* Floating mascot */}
      <div className="animate-float relative z-10">
        <Image
          src="/icon.png"
          alt="Loading…"
          width={120}
          height={120}
          priority
          className="drop-shadow-[0_6px_24px_rgba(168,85,247,0.3)]"
        />
      </div>

      {/* Wordmark */}
      <p
        className="
          font-[family-name:var(--font-bangers)]
          text-3xl tracking-widest gradient-text
          mt-2 select-none
        "
      >
        DANKRUPT
      </p>

      {/* Bouncing dots */}
      <div className="flex items-center gap-2 mt-4">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block w-1.5 h-1.5 rounded-full bg-accent animate-dot"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>
    </div>
  )
}
