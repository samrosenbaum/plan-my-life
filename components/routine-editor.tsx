"use client"

import { useState } from "react"
import type { SubActivity } from "@/lib/types"
import { Plus, X, Check, GripVertical } from "lucide-react"

interface RoutineEditorProps {
  subActivities: SubActivity[]
  completions: Record<string, boolean>
  routineColor: string
  onUpdateSubActivities: (subActivities: SubActivity[]) => void
  onToggleSubActivity: (subActivityId: string) => void
  compact?: boolean
}

export function RoutineEditor({
  subActivities,
  completions,
  routineColor,
  onUpdateSubActivities,
  onToggleSubActivity,
  compact = false,
}: RoutineEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newLabel, setNewLabel] = useState("")
  const [newDuration, setNewDuration] = useState(15)

  const sortedActivities = [...subActivities].sort((a, b) => a.order - b.order)

  const handleAddSubActivity = () => {
    if (!newLabel.trim()) return

    const newActivity: SubActivity = {
      id: `sub-${Date.now()}`,
      label: newLabel.trim(),
      durationMinutes: newDuration,
      order: subActivities.length,
    }

    onUpdateSubActivities([...subActivities, newActivity])
    setNewLabel("")
    setNewDuration(15)
  }

  const handleRemoveSubActivity = (id: string) => {
    onUpdateSubActivities(subActivities.filter((s) => s.id !== id))
  }

  const totalMinutes = subActivities.reduce((sum, s) => sum + s.durationMinutes, 0)
  const completedCount = Object.values(completions).filter(Boolean).length

  if (compact) {
    return (
      <div className="mt-2 space-y-1">
        {sortedActivities.map((sub) => {
          const isCompleted = completions[sub.id] || false
          return (
            <button
              key={sub.id}
              onClick={() => onToggleSubActivity(sub.id)}
              className="w-full flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-secondary/50 transition-colors text-left"
            >
              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all ${
                  isCompleted ? "bg-green-500 border-green-500" : "border-current"
                }`}
                style={{ borderColor: isCompleted ? undefined : routineColor }}
              >
                {isCompleted && <Check className="h-3 w-3 text-white" />}
              </div>
              <span className={`font-mono text-xs flex-1 ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {sub.label}
              </span>
              <span className="font-mono text-xs text-muted-foreground">{sub.durationMinutes}m</span>
            </button>
          )
        })}

        {sortedActivities.length === 0 && (
          <p className="text-center py-2 font-mono text-xs text-muted-foreground">
            no breakdown yet
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-secondary/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-mono text-sm text-foreground">routine breakdown</h3>
          <p className="font-mono text-xs text-muted-foreground">
            {completedCount}/{sortedActivities.length} done · {totalMinutes} mins total
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="rounded-lg px-3 py-1 font-mono text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          {isEditing ? "done" : "edit"}
        </button>
      </div>

      <div className="space-y-2">
        {sortedActivities.map((sub) => {
          const isCompleted = completions[sub.id] || false
          return (
            <div
              key={sub.id}
              className="flex items-center gap-2 rounded-xl border-2 border-dashed border-border bg-card px-3 py-2"
            >
              <button
                onClick={() => onToggleSubActivity(sub.id)}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                  isCompleted ? "bg-green-500 border-green-500" : "border-current hover:border-primary"
                }`}
                style={{ borderColor: isCompleted ? undefined : routineColor }}
              >
                {isCompleted && <Check className="h-4 w-4 text-white" />}
              </button>

              <div className="flex-1">
                <p className={`font-mono text-sm ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {sub.label}
                </p>
              </div>

              <span className="font-mono text-xs text-muted-foreground">{sub.durationMinutes}m</span>

              {isEditing && (
                <button
                  onClick={() => handleRemoveSubActivity(sub.id)}
                  className="min-w-[32px] min-h-[32px] p-1 rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {isEditing && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Activity name..."
              className="flex-1 rounded-xl border-2 border-dashed border-border bg-secondary px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddSubActivity()
                }
              }}
            />
            <select
              value={newDuration}
              onChange={(e) => setNewDuration(Number(e.target.value))}
              className="rounded-xl border-2 border-dashed border-border bg-secondary px-3 py-2 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value={5}>5m</option>
              <option value={10}>10m</option>
              <option value={15}>15m</option>
              <option value={20}>20m</option>
              <option value={30}>30m</option>
              <option value={45}>45m</option>
              <option value={60}>60m</option>
            </select>
            <button
              onClick={handleAddSubActivity}
              disabled={!newLabel.trim()}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {sortedActivities.length === 0 && !isEditing && (
        <div className="text-center py-4">
          <p className="font-mono text-xs text-muted-foreground mb-2">
            No breakdown yet. Click edit to add activities.
          </p>
        </div>
      )}
    </div>
  )
}
