"use client"

import { useState } from "react"
import { TextControls } from "./TextControls"
import { AICaptionPanel } from "./AICaptionPanel"

type Tab = "text" | "ai"

export function EditorSidebar() {
  const [activeTab, setActiveTab] = useState<Tab>("text")

  return (
    <aside className="w-64 shrink-0 border-l border-border flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-border shrink-0">
        {(["text", "ai"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === tab
                ? "text-foreground border-b-2 border-accent -mb-px"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab === "ai" ? "✦ AI" : "Text"}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "text" ? <TextControls /> : <AICaptionPanel />}
      </div>
    </aside>
  )
}
