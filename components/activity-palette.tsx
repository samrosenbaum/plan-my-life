"use client"

import type React from "react"

import { useState } from "react"
import type { ActivityBlock } from "@/lib/types"
import { ActivityIcon } from "./activity-icon"
import { Pencil, Trash2 } from "lucide-react"

interface ActivityPaletteProps {
  activities: ActivityBlock[]
  onDragStart: (activity: ActivityBlock) => void
  onDragEnd: () => void
  inline?: boolean // Added inline prop for horizontal layout
  onEditActivity?: (activity: ActivityBlock) => void
  onDeleteActivity?: (activityId: string) => void
}

export function ActivityPalette({
  activities,
  onDragStart,
  onDragEnd,
  inline,
  onEditActivity,
  onDeleteActivity
}: ActivityPaletteProps) {
  if (inline) {
    return (
      <div className="flex flex-wrap gap-3">
        {activities.map((activity) => (
          <DraggableActivity
            key={activity.id}
            activity={activity}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onEdit={onEditActivity}
            onDelete={onDeleteActivity}
          />
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
          <DraggableActivity
            key={activity.id}
            activity={activity}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onEdit={onEditActivity}
            onDelete={onDeleteActivity}
          />
        ))}
      </div>
    </div>
  )
}

interface DraggableActivityProps {
  activity: ActivityBlock
  onDragStart: (activity: ActivityBlock) => void
  onDragEnd: () => void
  onEdit?: (activity: ActivityBlock) => void
  onDelete?: (activityId: string) => void
}

function DraggableActivity({ activity, onDragStart, onDragEnd, onEdit, onDelete }: DraggableActivityProps) {
  const [isDragging, setIsDragging] = useState(false)
  const isCustom = activity.id.startsWith("custom-")

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

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    onDragStart(activity)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    onDragEnd()
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onEdit) onEdit(activity)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onDelete && confirm(`Delete "${activity.label}"?`)) {
      onDelete(activity.id)
    }
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`
        group relative flex cursor-grab items-center gap-2 rounded-2xl border-2 border-dashed
        bg-secondary px-3 py-3 min-h-[44px] transition-all duration-200 ease-out
        hover:border-primary hover:bg-secondary/80 hover:shadow-md
        active:cursor-grabbing active:scale-95
        ${isDragging ? "scale-95 opacity-50 border-primary" : "border-border"}
      `}
      style={{ borderColor: isDragging ? activity.color : undefined }}
    >
      <ActivityIcon icon={activity.icon} color={activity.color} className="h-5 w-5 shrink-0" />
      <div className="flex-1 flex items-center gap-1 min-w-0">
        <span className="truncate font-mono text-xs text-foreground">{activity.label}</span>
        {activity.isRoutine && (
          <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary">
            routine
          </span>
        )}
      </div>

      {isCustom && (onEdit || onDelete) && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={handleEdit}
              className="min-w-[32px] min-h-[32px] p-1 rounded-lg hover:bg-primary/10 transition-colors"
              title="Edit activity"
            >
              <Pencil className="h-3 w-3 text-muted-foreground hover:text-primary" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="min-w-[32px] min-h-[32px] p-1 rounded-lg hover:bg-destructive/10 transition-colors"
              title="Delete activity"
            >
              <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
            </button>
          )}
        </div>
      )}
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
