"use client"

import { useRef } from "react"
import dynamic from "next/dynamic"
import { useEditorStore, type TextLayer } from "@/store/editor"
import { EditorToolbar } from "./EditorToolbar"
import { EditorSidebar } from "./EditorSidebar"
import type { TemplateFull } from "@/types"

const EditorCanvas = dynamic(
  () => import("./EditorCanvas").then((m) => m.EditorCanvas),
  { ssr: false }
)

interface Props {
  template: TemplateFull | null
  layers: TextLayer[]
  sourceMemeId: string
}

export function EditorRemixLoader({ template, layers, sourceMemeId }: Props) {
  const initialized = useRef(false)

  // Set saved meme state synchronously before canvas mounts
  if (!initialized.current) {
    initialized.current = true
    useEditorStore.getState().loadMemeState(template, layers, sourceMemeId)
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
