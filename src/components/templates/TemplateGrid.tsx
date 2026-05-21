import { TemplateCard } from "./TemplateCard"
import type { TemplateSlim } from "@/types"

interface Props {
  templates: TemplateSlim[]
  emptyMessage?: string
}

export function TemplateGrid({ templates, emptyMessage }: Props) {
  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-5xl mb-5">{emptyMessage ? "🔍" : "🫙"}</p>
        <p className="text-muted font-semibold text-sm">
          {emptyMessage ?? "No templates here yet."}
        </p>
        {!emptyMessage && (
          <p className="text-muted/40 text-xs mt-2 font-mono">
            Run{" "}
            <code className="bg-surface-elevated px-1.5 py-0.5 rounded border border-border">
              npm run db:seed
            </code>{" "}
            to populate demo data.
          </p>
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
