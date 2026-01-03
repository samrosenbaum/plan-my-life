"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, memo } from "react"
import type { ActivityBlock, ScheduleSlot, SubActivity } from "@/lib/types"
import { ActivityIcon } from "./activity-icon"
import { X, Check, ChevronLeft, ChevronRight, GripVertical, ChevronDown, ChevronUp } from "lucide-react"
import { useSwipe } from "@/lib/use-swipe"
import { RoutineEditor } from "./routine-editor"

interface ScheduleBoardProps {
  schedule: ScheduleSlot[]
  selectedDate: Date
  currentTime: Date
  onDrop: (slotId: string, duration?: number) => void
  onRemove: (slotId: string) => void
  onToggleComplete: (slotId: string) => void
  onResize?: (slotId: string, newDuration: number) => void
  draggedActivity: ActivityBlock | null
  onDateChange: (date: Date) => void
}

export function ScheduleBoard({
  schedule,
  selectedDate,
  currentTime,
  onDrop,
  onRemove,
  onToggleComplete,
  onResize,
  draggedActivity,
  onDateChange,
}: ScheduleBoardProps) {
  const isToday = selectedDate.toDateString() === currentTime.toDateString()
  const isPast = selectedDate < new Date(currentTime.toDateString())
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const swipeContainerRef = useRef<HTMLDivElement>(null)

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    onDateChange(newDate)
  }

  const goToNextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    onDateChange(newDate)
  }

  const goToToday = () => {
    onDateChange(currentTime)
  }

  const currentHour = currentTime.getHours()

  const handleAutoScroll = useCallback((e: React.DragEvent) => {
    const container = scrollContainerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const scrollSpeed = 8
    const edgeThreshold = 80 // pixels from edge to start scrolling

    const mouseY = e.clientY
    const distanceFromTop = mouseY - rect.top
    const distanceFromBottom = rect.bottom - mouseY

    // Clear any existing interval
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current)
      scrollIntervalRef.current = null
    }

    if (distanceFromTop < edgeThreshold && container.scrollTop > 0) {
      // Scroll up
      scrollIntervalRef.current = setInterval(() => {
        container.scrollTop -= scrollSpeed
      }, 16)
    } else if (
      distanceFromBottom < edgeThreshold &&
      container.scrollTop < container.scrollHeight - container.clientHeight
    ) {
      // Scroll down
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current)
      }
    }
  }, [])

  // Swipe navigation
  useSwipe(swipeContainerRef, {
    onSwipeLeft: goToNextDay,
    onSwipeRight: goToPreviousDay,
    threshold: 75,
  })

  // Filter out continuation slots for rendering
  const visibleSchedule = schedule.filter((slot) => !slot.isContinuation)

  return (
    <div ref={swipeContainerRef} className="rounded-3xl bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={goToPreviousDay} className="rounded-full min-w-[44px] min-h-[44px] p-3 hover:bg-secondary transition-colors flex items-center justify-center">
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <SketchClockIcon className="h-5 w-5 text-primary" />
            <h2 className="font-mono text-sm tracking-wide text-foreground">
              {isToday ? "today" : selectedDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()}
            </h2>
          </div>
          <button onClick={goToNextDay} className="rounded-full min-w-[44px] min-h-[44px] p-3 hover:bg-secondary transition-colors flex items-center justify-center">
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {!isToday && (
            <button
              onClick={goToToday}
              className="rounded-full bg-primary/10 min-h-[44px] px-4 py-2 font-mono text-xs text-primary hover:bg-primary/20 transition-colors"
            >
              today
            </button>
          )}
          <span className="font-mono text-xs text-muted-foreground hidden sm:inline">
            {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-2">
        <span className="font-mono text-xs text-muted-foreground">completion</span>
        <CompletionBar schedule={schedule} />
      </div>

      <div
        ref={scrollContainerRef}
        className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 scroll-smooth"
        onDragOver={draggedActivity ? handleAutoScroll : undefined}
        onDragLeave={stopAutoScroll}
        onDrop={stopAutoScroll}
      >
        {visibleSchedule.map((slot) => {
          const slotHour = parseTimeToHour(slot.time)
          const isCurrentSlot = isToday && slotHour === currentHour
          const slotPassed = isToday ? slotHour < currentHour : isPast
          const slotIndex = schedule.findIndex((s) => s.id === slot.id)

          return (
            <TimeSlot
              key={slot.id}
              slot={slot}
              slotIndex={slotIndex}
              totalSlots={schedule.length}
              onDrop={onDrop}
              onRemove={onRemove}
              onToggleComplete={onToggleComplete}
              onResize={onResize}
              isDropTarget={!!draggedActivity}
              isCurrentSlot={isCurrentSlot}
              slotPassed={slotPassed}
            />
          )
        })}
      </div>
    </div>
  )
}

function parseTimeToHour(time: string): number {
  const [hourStr, period] = time.split(" ")
  let hour = Number.parseInt(hourStr.split(":")[0])
  if (period === "PM" && hour !== 12) hour += 12
  if (period === "AM" && hour === 12) hour = 0
  return hour
}

function CompletionBar({ schedule }: { schedule: ScheduleSlot[] }) {
  const withActivities = schedule.filter((s) => s.activity && !s.isContinuation)
  const completed = withActivities.filter((s) => s.completed).length
  const total = withActivities.length
  const ratio = total > 0 ? completed / total : 0

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${ratio * 100}%`,
            backgroundColor: ratio === 1 ? "#22c55e" : ratio > 0.5 ? "#5B6EE1" : ratio > 0 ? "#eab308" : "#e5e5e5",
          }}
        />
      </div>
      <span className="font-mono text-xs text-foreground">
        {completed}/{total}
      </span>
    </div>
  )
}

interface TimeSlotProps {
  slot: ScheduleSlot
  slotIndex: number
  totalSlots: number
  onDrop: (slotId: string, duration?: number) => void
  onRemove: (slotId: string) => void
  onToggleComplete: (slotId: string) => void
  onResize?: (slotId: string, newDuration: number) => void
  isDropTarget: boolean
  isCurrentSlot: boolean
  slotPassed: boolean
}

const TimeSlot = memo(function TimeSlot({
  slot,
  slotIndex,
  totalSlots,
  onDrop,
  onRemove,
  onToggleComplete,
  onResize,
  isDropTarget,
  isCurrentSlot,
  slotPassed,
}: TimeSlotProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeStartY, setResizeStartY] = useState(0)
  const [currentDuration, setCurrentDuration] = useState(slot.activity?.duration || 1)
  const [isExpanded, setIsExpanded] = useState(slot.isExpanded || false)
  const [subCompletions, setSubCompletions] = useState<Record<string, boolean>>(slot.subActivityCompletions || {})
  const slotRef = useRef<HTMLDivElement>(null)

  const duration = slot.activity?.duration || 1
  const isRoutine = slot.activity?.isRoutine || false

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    onDrop(slot.id)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDropTarget) return
    const touch = e.touches[0]
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    if (element && slotRef.current?.contains(element)) {
      setIsDragOver(true)
    } else {
      setIsDragOver(false)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDropTarget) return
    const touch = e.changedTouches[0]
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    if (element && slotRef.current?.contains(element)) {
      onDrop(slot.id)
    }
    setIsDragOver(false)
  }

  const handleToggleSubActivity = (subActivityId: string) => {
    setSubCompletions((prev) => ({
      ...prev,
      [subActivityId]: !prev[subActivityId],
    }))
  }

  const handleUpdateSubActivities = (newSubActivities: SubActivity[]) => {
    // For now, this is a placeholder - in full implementation would update in parent
    console.log("Update sub-activities:", newSubActivities)
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setResizeStartY(e.clientY)
    setCurrentDuration(duration)
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - resizeStartY
      const slotHeight = 56 // approximate height of one slot
      const durationChange = Math.round(deltaY / slotHeight)
      const newDuration = Math.max(1, Math.min(duration + durationChange, totalSlots - slotIndex))
      setCurrentDuration(newDuration)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      if (onResize && currentDuration !== duration) {
        onResize(slot.id, currentDuration)
      }
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing, resizeStartY, duration, currentDuration, onResize, slot.id, slotIndex, totalSlots])

  const displayDuration = isResizing ? currentDuration : duration

  return (
    <div
      ref={slotRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`group relative flex items-start gap-4 rounded-2xl border-2 border-dashed p-3 transition-all duration-200 ease-out text-popover ${isCurrentSlot ? "ring-2 ring-primary ring-offset-2" : ""}
        ${
          slot.activity
            ? "border-transparent bg-secondary"
            : isDragOver
              ? "border-primary bg-primary/5 scale-[1.02]"
              : isDropTarget
                ? "border-border/60 bg-secondary/50"
                : "border-transparent bg-secondary/30"
        }
      `}
      style={{
        minHeight: slot.activity ? `${displayDuration * 52 + (displayDuration - 1) * 8}px` : undefined,
      }}
    >
      {isCurrentSlot && <div className="absolute -left-1 top-4 h-3 w-3 rounded-full bg-primary animate-pulse" />}

      {/* Time */}
      <span
        className={`w-20 shrink-0 font-mono text-xs pt-1 ${slotPassed ? "text-muted-foreground/50" : "text-muted-foreground"}`}
      >
        {slot.time}
        {slot.activity && displayDuration > 1 && (
          <span className="block text-[10px] text-muted-foreground/70">{displayDuration}h</span>
        )}
      </span>

      {/* Activity or Empty State */}
      <div className="flex-1 h-full">
        {slot.activity ? (
          <div
            className={`relative flex flex-col justify-between rounded-xl bg-card px-3 py-2 shadow-sm transition-all duration-200 hover:shadow-md h-full ${
              slot.completed ? "opacity-60" : ""
            } ${isResizing ? "ring-2 ring-primary" : ""}`}
            style={{ borderLeft: `3px solid ${slot.completed ? "#22c55e" : slot.activity.color}` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleComplete(slot.id)}
                  className={`flex h-6 w-6 min-w-[44px] min-h-[44px] items-center justify-center rounded-md border-2 transition-all duration-200 ${
                    slot.completed ? "border-green-500 bg-green-500 text-white" : "border-border hover:border-primary"
                  }`}
                >
                  {slot.completed && <Check className="h-5 w-5" />}
                </button>
                <ActivityIcon
                  icon={slot.activity.icon}
                  color={slot.completed ? "#22c55e" : slot.activity.color}
                  className="h-5 w-5"
                />
                <span
                  className={`font-mono text-xs ${slot.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
                >
                  {slot.activity.label}
                </span>
                {isRoutine && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="ml-2 p-1 hover:bg-secondary rounded transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                )}
              </div>
              <button
                onClick={() => onRemove(slot.id)}
                className="opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity min-w-[44px] min-h-[44px] p-2 rounded-full hover:bg-destructive/10"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </button>
            </div>

            {isRoutine && isExpanded && slot.activity.subActivities && (
              <div className="mt-3">
                <RoutineEditor
                  subActivities={slot.activity.subActivities}
                  completions={subCompletions}
                  routineColor={slot.activity.color}
                  onUpdateSubActivities={handleUpdateSubActivities}
                  onToggleSubActivity={handleToggleSubActivity}
                  compact
                />
              </div>
            )}

            {onResize && (
              <div
                onMouseDown={handleResizeStart}
                onTouchStart={(e) => handleResizeStart(e as any)}
                className="absolute bottom-0 left-0 right-0 h-8 cursor-ns-resize flex items-center justify-center opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity touch-none"
              >
                <div className="flex items-center gap-0.5 bg-muted/50 rounded-full px-3 py-1">
                  <GripVertical className="h-4 w-4 text-muted-foreground rotate-90" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-9 items-center justify-center">
            {isDragOver ? (
              <span className="font-mono text-xs text-primary animate-pulse">drop here</span>
            ) : (
              <div className={`h-px w-full ${slotPassed ? "bg-border/30" : "bg-border/50"}`} />
            )}
          </div>
        )}
      </div>
    </div>
  )
})

function SketchClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v6l4 2" strokeLinecap="round" />
    </svg>
  )
}
