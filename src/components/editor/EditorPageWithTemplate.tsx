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

  // Set template synchronously before canvas mounts so useEditorStore.getState()
  // already has the layers when the Fabric useEffect fires.
  if (!initialized.current) {
    initialized.current = true
    useEditorStore.getState().setTemplate(template)
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 3rem)" }}>
      <EditorToolbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto bg-[#0d0d0d]">
          <EditorCanvas />
        </div>
        <EditorSidebar />
      </div>
    </div>
  )
}
