"use client"

import dynamic from "next/dynamic"
import { EditorToolbar } from "@/components/editor/EditorToolbar"
import { EditorSidebar } from "@/components/editor/EditorSidebar"

// Fabric.js touches canvas APIs — must be client-only, no SSR
const EditorCanvas = dynamic(
  () => import("@/components/editor/EditorCanvas").then((m) => m.EditorCanvas),
  { ssr: false }
)

export default function CreatePage() {
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <EditorToolbar />

      {/* Mobile: canvas stacked above sidebar.  Desktop: side-by-side. */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        {/* Canvas area */}
        <div className="flex-1 min-h-0 min-w-0 overflow-hidden bg-[#0d0d0d] p-3 md:p-6">
          <EditorCanvas />
        </div>

        <EditorSidebar />
      </div>
    </div>
  )
}
