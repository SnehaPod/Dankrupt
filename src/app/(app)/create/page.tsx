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
    <div className="flex flex-col" style={{ height: "calc(100vh - 3rem)" }}>
      <EditorToolbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto bg-[#0d0d0d]">
          <EditorCanvas />
        </div>
        {/* Sidebar */}
        <EditorSidebar />
      </div>
    </div>
  )
}
