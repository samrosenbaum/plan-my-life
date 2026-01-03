"use client"

import type React from "react"

import { useState } from "react"
import type { ActivityBlock } from "@/lib/types"
import { ActivityIcon } from "./activity-icon"

interface ActivityPaletteProps {
  activities: ActivityBlock[]
  onDragStart: (activity: ActivityBlock) => void
  onDragEnd: () => void
  inline?: boolean // Added inline prop for horizontal layout
}

export function ActivityPalette({ activities, onDragStart, onDragEnd, inline }: ActivityPaletteProps) {
  if (inline) {
    return (
      <div className="flex flex-wrap gap-3">
        {activities.map((activity) => (
          <DraggableActivity key={activity.id} activity={activity} onDragStart={onDragStart} onDragEnd={onDragEnd} />
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-3xl bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <SketchPuzzleIcon className="h-5 w-5 text-primary" />
        <h2 className="font-mono text-sm tracking-wide text-foreground">activities</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {activities.map((activity) => (
          <DraggableActivity key={activity.id} activity={activity} onDragStart={onDragStart} onDragEnd={onDragEnd} />
        ))}
      </div>
    </div>
  )
}

interface DraggableActivityProps {
  activity: ActivityBlock
  onDragStart: (activity: ActivityBlock) => void
  onDragEnd: () => void
}

function DraggableActivity({ activity, onDragStart, onDragEnd }: DraggableActivityProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    onDragStart(activity)
    e.dataTransfer.effectAllowed = "copy"
    // Create a custom drag image
    const dragElement = e.currentTarget.cloneNode(true) as HTMLElement
    dragElement.style.transform = "rotate(3deg)"
    document.body.appendChild(dragElement)
    e.dataTransfer.setDragImage(dragElement, 50, 25)
    setTimeout(() => document.body.removeChild(dragElement), 0)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    onDragEnd()
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`
        group flex cursor-grab items-center gap-2 rounded-2xl border-2 border-dashed
        bg-secondary px-3 py-2.5 transition-all duration-200 ease-out
        hover:border-primary hover:bg-secondary/80 hover:shadow-md
        active:cursor-grabbing active:scale-95
        ${isDragging ? "scale-95 opacity-50 border-primary" : "border-border"}
      `}
      style={{ borderColor: isDragging ? activity.color : undefined }}
    >
      <ActivityIcon icon={activity.icon} color={activity.color} className="h-5 w-5 shrink-0" />
      <span className="truncate font-mono text-xs text-foreground">{activity.label}</span>
    </div>
  )
}

function SketchPuzzleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M4 8h4a2 2 0 0 0 2-2V4" strokeLinecap="round" />
      <path d="M4 8v8a2 2 0 0 0 2 2h8" strokeLinecap="round" />
      <path d="M14 18h4a2 2 0 0 0 2-2V8" strokeLinecap="round" />
      <path d="M14 4v2a2 2 0 0 0 2 2h4" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}
