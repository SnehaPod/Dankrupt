import Link from "next/link"
import { TemplateCard } from "./TemplateCard"
import { RefreshLink } from "./RefreshLink"
import type { TemplateSlim } from "@/types"

interface Props {
  templates: TemplateSlim[]
  emptyMessage?: string
}

export function TemplateGrid({ templates, emptyMessage }: Props) {
  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        {emptyMessage ? (
          // Search / filter returned no results
          <>
            <span className="text-5xl select-none">🔍</span>
            <div>
              <p className="text-foreground/70 font-semibold text-sm">
                {emptyMessage}
              </p>
              <p className="text-muted/50 text-xs mt-1">
                Try a broader term, or{" "}
                <Link
                  href="/trending"
                  className="underline underline-offset-2 hover:text-accent transition-colors"
                >
                  browse all templates
                </Link>
                .
              </p>
            </div>
          </>
        ) : (
          // Initial load — APIs timed out or returned nothing
          <>
            <span className="text-5xl select-none">📡</span>
            <div>
              <p className="text-foreground/70 font-semibold text-sm">
                Templates are taking a moment to load
              </p>
              <p className="text-muted/50 text-xs mt-1">
                Imgflip and Giphy are being fetched — give it a second or{" "}
                <RefreshLink />.
              </p>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {templates.map((t) => (
        <TemplateCard key={t.id} template={t} />
      ))}
    </div>
  )
}
