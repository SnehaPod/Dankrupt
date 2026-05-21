import Image from "next/image"
import Link from "next/link"

interface LineageMeme {
  shortId: string
  imageUrl: string
}

interface Props {
  chain: LineageMeme[]       // ancestors + self, oldest first
  remixes: LineageMeme[]     // direct children
  currentShortId: string
}

export function RemixLineage({ chain, remixes, currentShortId }: Props) {
  if (chain.length <= 1 && remixes.length === 0) return null

  return (
    <div className="space-y-4">
      {/* Ancestor chain */}
      {chain.length > 1 && (
        <div>
          <p className="text-xs text-muted uppercase tracking-wider mb-2">Remix chain</p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {chain.map((m, i) => (
              <div key={m.shortId} className="flex items-center gap-2 shrink-0">
                <Link href={`/m/${m.shortId}`}>
                  <div
                    className={`relative w-16 h-10 rounded overflow-hidden border transition-colors ${
                      m.shortId === currentShortId
                        ? "border-accent"
                        : "border-border hover:border-muted"
                    }`}
                  >
                    <Image
                      src={m.imageUrl}
                      alt="Remix ancestor"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </Link>
                {i < chain.length - 1 && (
                  <span className="text-muted/40 text-xs">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Children */}
      {remixes.length > 0 && (
        <div>
          <p className="text-xs text-muted uppercase tracking-wider mb-2">
            {remixes.length} remix{remixes.length !== 1 ? "es" : ""}
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {remixes.map((m) => (
              <Link key={m.shortId} href={`/m/${m.shortId}`} className="shrink-0">
                <div className="relative w-20 h-12 rounded overflow-hidden border border-border hover:border-muted transition-colors">
                  <Image
                    src={m.imageUrl}
                    alt="Remix"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
