"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"

export function NavBar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

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
      <div className="ml-auto flex items-center gap-3">
        {/* Create CTA */}
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

        {/* Auth area */}
        {status === "loading" ? (
          <div className="w-8 h-8 rounded-full bg-surface-elevated animate-pulse" />
        ) : session?.user ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-full ring-1 ring-border/60 hover:ring-violet-500/50 transition-all"
              aria-label="User menu"
            >
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "User"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <span className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white">
                  {(session.user.name ?? "U")[0].toUpperCase()}
                </span>
              )}
            </button>

            {menuOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border/60 bg-surface shadow-xl z-50 py-1 overflow-hidden">
                  <div className="px-3 py-2 border-b border-border/40">
                    <p className="text-sm font-medium text-foreground truncate">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-muted truncate">
                      {session.user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      signOut()
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border border-border/60 text-muted hover:text-foreground hover:border-violet-500/50 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in
          </button>
        )}
      </div>
    </header>
  )
}
