"use client"

import { useRef } from "react"
import dynamic from "next/dynamic"
import { useEditorStore } from "@/store/editor"
import { EditorToolbar } from "./EditorToolbar"
import { EditorSidebar } from "./EditorSidebar"
import type { TemplateFull } from "@/types"

const EditorCanvas = dynamic(
  () => import("./EditorCanvas").then((m) => m.EditorCanvas),
  { ssr: false }
)

export function EditorPageWithTemplate({ template }: { template: TemplateFull }) {
  const initialized = useRef(false)

  if (!initialized.current) {
    initialized.current = true
    useEditorStore.getState().setTemplate(template)
  }

  return (
    // flex-1 + min-h-0 lets this fill the <main flex-col flex-1> in AppLayout
    // without the old calc(100vh - 3rem) hack.
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
