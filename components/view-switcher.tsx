"use client"

import type { ViewMode } from "@/lib/types"

interface ViewSwitcherProps {
  viewMode: ViewMode
  onViewChange: (mode: ViewMode) => void
}

export function ViewSwitcher({ viewMode, onViewChange }: ViewSwitcherProps) {
  const views: { mode: ViewMode; label: string }[] = [
    { mode: "essentials", label: "essentials" },
    { mode: "day", label: "day" },
    { mode: "week", label: "week" },
    { mode: "month", label: "month" },
    { mode: "year", label: "year" },
  ]

  return (
    <div className="mb-6 flex justify-center">
      <div className="inline-flex items-center gap-1 rounded-full bg-card p-1 shadow-sm">
        {views.map(({ mode, label }) => (
          <button
            key={mode}
            onClick={() => onViewChange(mode)}
            className={`
              rounded-full px-4 py-1.5 font-mono text-xs transition-all duration-200
              ${
                viewMode === mode
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
