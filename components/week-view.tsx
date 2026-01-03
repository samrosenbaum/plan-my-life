"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import type { DaySchedule, ActivityBlock, ScheduleSlot } from "@/lib/types"
import { ActivityIcon } from "./activity-icon"
import { ChevronLeft, ChevronRight, Plus, GripVertical } from "lucide-react"

interface WeekViewProps {
  currentDate: Date
  schedulesByDate: Record<string, DaySchedule>
  activities: ActivityBlock[]
  getCompletionStats: (dateKey: string) => { total: number; completed: number; ratio: number }
  onSelectDate: (date: Date) => void
  onDropActivity: (dateKey: string, slotId: string, activity: ActivityBlock, duration?: number) => void
  onRemoveActivity: (dateKey: string, slotId: string) => void
  onToggleComplete: (dateKey: string, slotId: string) => void
  onWeekChange: (date: Date) => void
  onAddCustomBlock: (block: ActivityBlock) => void
  onResizeActivity?: (dateKey: string, slotId: string, newDuration: number) => void
}

const presetColors = [
  "#5B6EE1", // Blue
  "#7C5CE0", // Purple
  "#E15B8C", // Pink
  "#5BB8E1", // Cyan
  "#5BE17C", // Green
  "#E1B85B", // Yellow
  "#E17C5B", // Orange
]

const presetIcons = ["star", "heart", "book", "coffee", "music", "sun", "moon", "zap"]

const timeSlots = [
  "6:00 AM",
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
]

export function WeekView({
  currentDate,
  schedulesByDate,
  activities,
  getCompletionStats,
  onSelectDate,
  onDropActivity,
  onRemoveActivity,
  onToggleComplete,
  onWeekChange,
  onAddCustomBlock,
  onResizeActivity,
}: WeekViewProps) {
  const [draggedActivity, setDraggedActivity] = useState<ActivityBlock | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const [showCustomCreator, setShowCustomCreator] = useState(false)
  const [customLabel, setCustomLabel] = useState("")
  const [customColor, setCustomColor] = useState(presetColors[0])
  const [customIcon, setCustomIcon] = useState(presetIcons[0])
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    return date
  })

  const today = new Date().toDateString()

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 7)
    onWeekChange(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 7)
    onWeekChange(newDate)
  }

  const goToThisWeek = () => {
    onWeekChange(new Date())
  }

  const isCurrentWeek = weekDays.some((d) => d.toDateString() === new Date().toDateString())

  const handleDragStart = (activity: ActivityBlock) => {
    setDraggedActivity(activity)
  }

  const handleDragEnd = () => {
    setDraggedActivity(null)
    setDropTarget(null)
    stopAutoScroll()
  }

  const handleDragOver = (e: React.DragEvent, dateKey: string, slotIndex: number) => {
    e.preventDefault()
    setDropTarget(`${dateKey}-${slotIndex}`)
    handleAutoScroll(e)
  }

  const handleDragLeave = () => {
    setDropTarget(null)
  }

  const handleDrop = (e: React.DragEvent, dateKey: string, slotIndex: number) => {
    e.preventDefault()
    if (draggedActivity) {
      const slotId = `${dateKey}-slot-${slotIndex}`
      onDropActivity(dateKey, slotId, draggedActivity)
    }
    setDraggedActivity(null)
    setDropTarget(null)
    stopAutoScroll()
  }

  const handleAutoScroll = useCallback((e: React.DragEvent) => {
    const container = scrollContainerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const scrollSpeed = 10
    const edgeThreshold = 60

    const mouseY = e.clientY
    const distanceFromTop = mouseY - rect.top
    const distanceFromBottom = rect.bottom - mouseY

    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current)
      scrollIntervalRef.current = null
    }

    if (distanceFromTop < edgeThreshold && container.scrollTop > 0) {
      scrollIntervalRef.current = setInterval(() => {
        container.scrollTop -= scrollSpeed
      }, 16)
    } else if (
      distanceFromBottom < edgeThreshold &&
      container.scrollTop < container.scrollHeight - container.clientHeight
    ) {
      scrollIntervalRef.current = setInterval(() => {
        container.scrollTop += scrollSpeed
      }, 16)
    }
  }, [])

  const stopAutoScroll = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current)
      scrollIntervalRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current)
      }
    }
  }, [])

  const getSlotForDate = (dateKey: string, slotIndex: number): ScheduleSlot | null => {
    const schedule = schedulesByDate[dateKey]
    if (!schedule) return null
    return schedule.slots[slotIndex] || null
  }

  const handleCreateCustom = () => {
    if (!customLabel.trim()) return
    const newBlock: ActivityBlock = {
      id: `custom-${Date.now()}`,
      label: customLabel.trim(),
      icon: customIcon,
      color: customColor,
    }
    onAddCustomBlock(newBlock)
    setCustomLabel("")
    setCustomColor(presetColors[0])
    setCustomIcon(presetIcons[0])
    setShowCustomCreator(false)
  }

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-sm">
      <div className="rounded-2xl bg-secondary/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-xs text-muted-foreground">drag activities to schedule</p>
          <button
            onClick={() => setShowCustomCreator(!showCustomCreator)}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-xs transition-colors ${
              showCustomCreator
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-dashed border-border text-foreground hover:border-primary"
            }`}
          >
            <Plus className="h-3 w-3" />
            custom
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {activities.map((activity) => (
            <div
              key={activity.id}
              draggable
              onDragStart={() => handleDragStart(activity)}
              onDragEnd={handleDragEnd}
              className={`
                flex cursor-grab items-center gap-2 rounded-xl border-2 border-dashed
                px-3 py-2 transition-all duration-200
                hover:shadow-md active:cursor-grabbing active:scale-95
                ${draggedActivity?.id === activity.id ? "opacity-50 scale-95" : ""}
              `}
              style={{
                backgroundColor: `${activity.color}15`,
                borderColor: `${activity.color}50`,
              }}
            >
              <ActivityIcon icon={activity.icon} color={activity.color} className="h-4 w-4 shrink-0" />
              <span className="font-mono text-xs text-foreground">{activity.label}</span>
            </div>
          ))}
        </div>
      </div>

      {showCustomCreator && (
        <div className="rounded-2xl bg-secondary/50 p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1 block font-mono text-xs text-muted-foreground">label</label>
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="e.g., Morning Yoga"
                className="w-full rounded-xl border-2 border-dashed border-border bg-card px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1 block font-mono text-xs text-muted-foreground">color</label>
              <div className="flex gap-1.5">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCustomColor(color)}
                    className={`h-7 w-7 rounded-full transition-all duration-200 ${
                      customColor === color ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block font-mono text-xs text-muted-foreground">icon</label>
              <div className="flex gap-1.5">
                {presetIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setCustomIcon(icon)}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200 ${
                      customIcon === icon
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <ActivityIcon icon={icon} color={customColor} className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateCustom}
              disabled={!customLabel.trim()}
              className="rounded-xl bg-primary px-4 py-2 font-mono text-xs text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              create
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={goToPreviousWeek}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-border bg-secondary transition-all hover:border-primary hover:bg-primary/10"
          >
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>

          <div>
            <h2 className="font-mono text-lg text-foreground">
              week of {startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </h2>
            <p className="font-mono text-xs text-muted-foreground mt-0.5">
              {startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
              {weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>

          <button
            onClick={goToNextWeek}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-border bg-secondary transition-all hover:border-primary hover:bg-primary/10"
          >
            <ChevronRight className="h-4 w-4 text-foreground" />
          </button>

          {!isCurrentWeek && (
            <button
              onClick={goToThisWeek}
              className="ml-2 rounded-full bg-primary/10 px-3 py-1 font-mono text-xs text-primary transition-all hover:bg-primary/20"
            >
              this week
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1 mb-2">
            <div /> {/* Empty corner cell */}
            {weekDays.map((date) => {
              const dateKey = date.toISOString().split("T")[0]
              const stats = getCompletionStats(dateKey)
              const isToday = date.toDateString() === today

              return (
                <button
                  key={dateKey}
                  onClick={() => onSelectDate(date)}
                  className={`
                    flex flex-col items-center rounded-xl p-2 transition-all hover:bg-secondary/80
                    ${isToday ? "bg-primary/10 ring-1 ring-primary" : "bg-secondary/30"}
                  `}
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    {date.toLocaleDateString("en-US", { weekday: "short" }).toLowerCase()}
                  </span>
                  <span className={`font-mono text-sm ${isToday ? "text-primary font-medium" : "text-foreground"}`}>
                    {date.getDate()}
                  </span>
                  {stats.total > 0 && (
                    <div
                      className="mt-1 h-1.5 w-8 rounded-full"
                      style={{
                        backgroundColor:
                          stats.ratio === 1
                            ? "#22c55e"
                            : stats.ratio >= 0.5
                              ? "#5B6EE1"
                              : stats.ratio > 0
                                ? "#eab308"
                                : "#ef4444",
                      }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div
            ref={scrollContainerRef}
            className="max-h-[500px] overflow-y-auto rounded-2xl border border-border scroll-smooth"
            onDragLeave={stopAutoScroll}
          >
            {timeSlots.map((time, slotIndex) => (
              <div
                key={time}
                className="grid grid-cols-[60px_repeat(7,1fr)] gap-1 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center justify-end pr-2 py-1">
                  <span className="font-mono text-xs text-muted-foreground">{time.replace(":00", "")}</span>
                </div>

                {weekDays.map((date) => {
                  const dateKey = date.toISOString().split("T")[0]
                  const slot = getSlotForDate(dateKey, slotIndex)
                  const isDropTarget = dropTarget === `${dateKey}-${slotIndex}`

                  if (slot?.isContinuation) {
                    return <div key={`${dateKey}-${slotIndex}`} className="min-h-[40px]" />
                  }

                  const duration = slot?.activity?.duration || 1

                  return (
                    <div
                      key={`${dateKey}-${slotIndex}`}
                      onDragOver={(e) => handleDragOver(e, dateKey, slotIndex)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, dateKey, slotIndex)}
                      className={`
                        min-h-[40px] p-1 transition-all duration-150
                        ${isDropTarget ? "bg-primary/20 scale-[1.02]" : "hover:bg-secondary/30"}
                        ${slot?.activity ? "" : "border border-dashed border-transparent hover:border-border/50"}
                      `}
                      style={{
                        height: slot?.activity && duration > 1 ? `${duration * 41}px` : undefined,
                        gridRow: slot?.activity && duration > 1 ? `span ${duration}` : undefined,
                      }}
                    >
                      {slot?.activity ? (
                        <div
                          className={`
                            group relative flex flex-col justify-between gap-1 rounded-lg px-2 py-1 h-full
                            transition-all duration-200
                            ${slot.completed ? "opacity-60" : ""}
                          `}
                          style={{
                            backgroundColor: `${slot.activity.color}20`,
                            borderLeft: `3px solid ${slot.activity.color}`,
                          }}
                        >
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onToggleComplete(dateKey, slot.id)}
                              className={`
                                h-4 w-4 shrink-0 rounded border-2 transition-all flex items-center justify-center
                                ${slot.completed ? "bg-green-500 border-green-500" : "border-current hover:border-primary"}
                              `}
                              style={{ borderColor: slot.completed ? undefined : slot.activity.color }}
                            >
                              {slot.completed && (
                                <svg
                                  className="h-3 w-3 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>

                            <span
                              className={`font-mono text-xs truncate ${slot.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
                            >
                              {slot.activity.label.split(" - ")[0]}
                            </span>

                            <button
                              onClick={() => onRemoveActivity(dateKey, slot.id)}
                              className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-destructive text-white text-xs group-hover:flex transition-all"
                            >
                              x
                            </button>
                          </div>

                          {onResizeActivity && (
                            <div className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <GripVertical className="h-3 w-3 text-muted-foreground rotate-90" />
                            </div>
                          )}

                          {duration > 1 && (
                            <span className="font-mono text-[10px] text-muted-foreground">{duration}h</span>
                          )}
                        </div>
                      ) : (
                        isDropTarget && (
                          <div className="h-full rounded-lg border-2 border-dashed border-primary flex items-center justify-center">
                            <span className="font-mono text-xs text-primary">drop</span>
                          </div>
                        )
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-green-500" />
          <span className="font-mono text-xs text-muted-foreground">100%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-primary" />
          <span className="font-mono text-xs text-muted-foreground">50%+</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-yellow-500" />
          <span className="font-mono text-xs text-muted-foreground">{"<"}50%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-red-500" />
          <span className="font-mono text-xs text-muted-foreground">0%</span>
        </div>
      </div>
    </div>
  )
}
