"use client"

import type { DaySchedule } from "@/lib/types"
import { ActivityIcon } from "./activity-icon"
import { Check } from "lucide-react"

interface TodaysEssentialsProps {
  schedule: DaySchedule
  onToggleComplete: (slotId: string) => void
}

export function TodaysEssentials({ schedule, onToggleComplete }: TodaysEssentialsProps) {
  // Get all activities for today (excluding continuations)
  const activities = schedule.slots.filter((s) => s.activity && !s.isContinuation)

  if (activities.length === 0) {
    return (
      <div className="rounded-3xl bg-card p-6 shadow-sm">
        <h2 className="mb-4 font-mono text-lg text-foreground">today's essentials</h2>
        <p className="text-center font-mono text-sm text-muted-foreground py-8">
          no activities scheduled yet
        </p>
      </div>
    )
  }

  const completed = activities.filter((s) => s.completed).length
  const total = activities.length
  const completionRatio = total > 0 ? completed / total : 0

  return (
    <div className="rounded-3xl bg-card p-5 sm:p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-mono text-base sm:text-lg text-foreground">today's essentials</h2>
        <div className="flex items-center gap-2">
          <div className="h-2 w-16 sm:w-24 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${completionRatio * 100}%`,
                backgroundColor:
                  completionRatio === 1 ? "#22c55e" : completionRatio > 0.5 ? "#5B6EE1" : completionRatio > 0 ? "#eab308" : "#e5e5e5",
              }}
            />
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {completed}/{total}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {activities.map((slot) => (
          <button
            key={slot.id}
            onClick={() => onToggleComplete(slot.id)}
            className={`
              group relative flex items-center gap-3 rounded-2xl border-2 p-3 sm:p-4 transition-all duration-200
              ${
                slot.completed
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-dashed border-border bg-secondary hover:border-primary hover:bg-secondary/80"
              }
            `}
            style={{
              borderLeftWidth: "4px",
              borderLeftColor: slot.completed ? "#22c55e" : slot.activity?.color,
            }}
          >
            <div
              className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border-2 transition-all ${
                slot.completed ? "border-green-500 bg-green-500" : "border-current"
              }`}
              style={{
                borderColor: slot.completed ? undefined : slot.activity?.color,
                backgroundColor: slot.completed ? undefined : `${slot.activity?.color}15`,
              }}
            >
              {slot.completed ? (
                <Check className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              ) : (
                <ActivityIcon
                  icon={slot.activity?.icon || "star"}
                  color={slot.activity?.color || "#5B6EE1"}
                  className="h-4 w-4 sm:h-5 sm:w-5"
                />
              )}
            </div>

            <div className="flex-1 text-left">
              <p
                className={`font-mono text-xs sm:text-sm ${
                  slot.completed ? "line-through text-muted-foreground" : "text-foreground"
                }`}
              >
                {slot.activity?.label}
              </p>
              <p className="font-mono text-xs text-muted-foreground mt-0.5">{slot.time}</p>
            </div>
          </button>
        ))}
      </div>

      {completionRatio === 1 && (
        <div className="mt-4 rounded-xl bg-green-500/10 border border-green-500/30 px-4 py-3 text-center">
          <p className="font-mono text-sm text-green-700 dark:text-green-400">
            🎉 all done for today!
          </p>
        </div>
      )}
    </div>
  )
}
