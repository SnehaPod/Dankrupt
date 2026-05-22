"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function NavBar() {
  const pathname = usePathname()

  const isBrowsing =
    pathname === "/" || pathname === "/trending" || pathname.startsWith("/trending")
  const isCreating =
    pathname.startsWith("/create") || pathname.startsWith("/remix")

  return (
    <header className="h-14 sticky top-0 z-50 border-b border-border/60 flex items-center px-5 gap-5 shrink-0 bg-background/80 backdrop-blur-md">
      {/* Logo */}
      <Link
        href="/trending"
        className="font-[family-name:var(--font-bangers)] text-2xl tracking-widest gradient-text select-none"
      >
        DANKRUPT
      </Link>

      {/* Nav links */}
      <nav className="flex items-center gap-1 text-sm">
        <Link
          href="/trending"
          className={`relative px-3 py-1.5 rounded-md font-medium transition-colors ${
            isBrowsing
              ? "text-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          {isBrowsing && (
            <span className="absolute inset-0 rounded-md bg-surface-elevated" />
          )}
          <span className="relative">Trending</span>
        </Link>

        <Link
          href="/create"
          className={`relative px-3 py-1.5 rounded-md font-medium transition-colors ${
            isCreating
              ? "text-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          {isCreating && (
            <span className="absolute inset-0 rounded-md bg-surface-elevated" />
          )}
          <span className="relative">Create</span>
        </Link>
      </nav>

      {/* Right side */}
      <div className="ml-auto">
        <Link
          href="/create"
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold text-white
            bg-gradient-to-r from-violet-600 to-fuchsia-600
            hover:from-violet-500 hover:to-fuchsia-500
            shadow-[0_2px_12px_rgba(168,85,247,0.35)]
            hover:shadow-[0_2px_16px_rgba(168,85,247,0.5)]
            transition-all duration-200"
        >
          Create ✦
        </Link>
      </div>
    </header>
  )
}
