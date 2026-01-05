"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import type { DaySchedule } from "@/lib/types"

interface YearViewProps {
  currentDate: Date
  schedulesByDate: Record<string, DaySchedule>
  getCompletionStats: (dateKey: string) => { total: number; completed: number; ratio: number }
  onSelectDate: (date: Date) => void
  onYearChange: (date: Date) => void
}

export function YearView({
  currentDate,
  schedulesByDate,
  getCompletionStats,
  onSelectDate,
  onYearChange,
}: YearViewProps) {
  const year = currentDate.getFullYear()

  const goToPreviousYear = () => {
    onYearChange(new Date(year - 1, 0, 1))
  }

  const goToNextYear = () => {
    onYearChange(new Date(year + 1, 0, 1))
  }

  const months = Array.from({ length: 12 }, (_, i) => i)
  const today = new Date().toDateString()

  return (
    <div className="rounded-3xl bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button onClick={goToPreviousYear} className="rounded-full p-2 hover:bg-secondary transition-colors">
          <ChevronLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <h2 className="font-mono text-xl text-foreground">{year}</h2>
        <button onClick={goToNextYear} className="rounded-full p-2 hover:bg-secondary transition-colors">
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Year grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        {months.map((month) => {
          const firstDay = new Date(year, month, 1)
          const lastDay = new Date(year, month + 1, 0)
          const daysInMonth = lastDay.getDate()
          const monthName = firstDay.toLocaleDateString("en-US", { month: "short" }).toLowerCase()

          // Calculate month completion
          let totalActivities = 0
          let completedActivities = 0

          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day)
            const dateKey = date.toISOString().split("T")[0]
            const stats = getCompletionStats(dateKey)
            totalActivities += stats.total
            completedActivities += stats.completed
          }

          const monthRatio = totalActivities > 0 ? completedActivities / totalActivities : 0

          return (
            <div key={month} className="rounded-2xl bg-secondary/30 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-sm text-foreground">{monthName}</span>
                {totalActivities > 0 && (
                  <span className="font-mono text-xs text-muted-foreground">{Math.round(monthRatio * 100)}%</span>
                )}
              </div>

              {/* Mini month grid */}
              <div className="grid grid-cols-7 gap-0.5">
                {/* Padding for first day */}
                {Array.from({ length: firstDay.getDay() }).map((_, i) => (
                  <div key={`pad-${i}`} className="aspect-square" />
                ))}

                {/* Days */}
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
                    if (!hasActivities) return "hsl(var(--secondary))"
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
                        aspect-square rounded-sm transition-all hover:scale-150 hover:z-10
                        ${isToday ? "ring-1 ring-primary" : ""}
                      `}
                      style={{ backgroundColor: getColor() }}
                      title={`${date.toLocaleDateString()}: ${stats.completed}/${stats.total}${!isPast && hasActivities ? " (scheduled)" : ""}`}
                    />
                  )
                })}
              </div>
            </div>
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
