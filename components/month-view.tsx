"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import type { DaySchedule } from "@/lib/types"

interface MonthViewProps {
  currentDate: Date
  schedulesByDate: Record<string, DaySchedule>
  getCompletionStats: (dateKey: string) => { total: number; completed: number; ratio: number }
  onSelectDate: (date: Date) => void
  onMonthChange: (date: Date) => void
}

export function MonthView({
  currentDate,
  schedulesByDate,
  getCompletionStats,
  onSelectDate,
  onMonthChange,
}: MonthViewProps) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPadding = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const goToPreviousMonth = () => {
    const newDate = new Date(year, month - 1, 1)
    onMonthChange(newDate)
  }

  const goToNextMonth = () => {
    const newDate = new Date(year, month + 1, 1)
    onMonthChange(newDate)
  }

  const today = new Date().toDateString()
  const weekDays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]

  return (
    <div className="rounded-3xl bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button onClick={goToPreviousMonth} className="rounded-full p-2 hover:bg-secondary transition-colors">
          <ChevronLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <h2 className="font-mono text-lg text-foreground">
          {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toLowerCase()}
        </h2>
        <button onClick={goToNextMonth} className="rounded-full p-2 hover:bg-secondary transition-colors">
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center font-mono text-xs text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for padding */}
        {Array.from({ length: startPadding }).map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = new Date(year, month, i + 1)
          const dateKey = date.toISOString().split("T")[0]
          const stats = getCompletionStats(dateKey)
          const isToday = date.toDateString() === today
          const hasActivities = stats.total > 0
          const isPast = date < new Date(today)

          // Color logic:
          // - Green: 100% complete
          // - Blue: 50%+ complete
          // - Yellow: scheduled + (future OR some progress)
          // - Red: past + 0% complete
          const getColor = () => {
            if (!hasActivities) return "hsl(var(--secondary) / 0.3)"
            if (stats.ratio === 1) return "#22c55e" // Green - complete
            if (stats.ratio >= 0.5) return "#5B6EE1" // Blue - good progress
            if (!isPast) return "#eab308" // Yellow - future, not yet happened
            if (stats.ratio > 0) return "#eab308" // Yellow - past but some progress
            return "#ef4444" // Red - past with 0% done
          }

          return (
            <button
              key={i}
              onClick={() => onSelectDate(date)}
              className={`
                aspect-square rounded-xl flex flex-col items-center justify-center
                transition-all duration-200 hover:scale-105
                ${isToday ? "ring-2 ring-primary ring-offset-1" : ""}
              `}
              style={{ backgroundColor: getColor() }}
            >
              <span className={`font-mono text-sm ${hasActivities ? "text-white" : "text-foreground"}`}>{i + 1}</span>
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-green-500" />
          <span className="font-mono text-xs text-muted-foreground">complete</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-primary" />
          <span className="font-mono text-xs text-muted-foreground">50%+</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-yellow-500" />
          <span className="font-mono text-xs text-muted-foreground">scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-red-500" />
          <span className="font-mono text-xs text-muted-foreground">missed</span>
        </div>
      </div>
    </div>
  )
}
