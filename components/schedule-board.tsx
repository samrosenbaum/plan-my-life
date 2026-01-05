"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, memo } from "react"
import type { ActivityBlock, ScheduleSlot } from "@/lib/types"
import { ActivityIcon } from "./activity-icon"
import { X, Check, ChevronLeft, ChevronRight, GripVertical } from "lucide-react"
import { useSwipe } from "@/lib/use-swipe"

interface ScheduleBoardProps {
  schedule: ScheduleSlot[]
  selectedDate: Date
  currentTime: Date
  onDrop: (slotId: string, duration?: number) => void
  onRemove: (slotId: string) => void
  onToggleComplete: (slotId: string) => void
  onToggleStepComplete?: (slotId: string, stepId: string) => void
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
  onToggleStepComplete,
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

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()

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
          const slotMinutes = parseTimeToMinutes(slot.time)
          const isCurrentSlot = isToday && currentMinutes >= slotMinutes && currentMinutes < slotMinutes + 30
          const slotPassed = isToday ? slotMinutes + 30 <= currentMinutes : isPast
          const slotIndex = schedule.findIndex((s) => s.id === slot.id)
          const isHalfHour = isHalfHourSlot(slot.time)

          return (
            <TimeSlot
              key={slot.id}
              slot={slot}
              slotIndex={slotIndex}
              totalSlots={schedule.length}
              onDrop={onDrop}
              onRemove={onRemove}
              onToggleComplete={onToggleComplete}
              onToggleStepComplete={onToggleStepComplete}
              onResize={onResize}
              isDropTarget={!!draggedActivity}
              isCurrentSlot={isCurrentSlot}
              slotPassed={slotPassed}
              isHalfHour={isHalfHour}
            />
          )
        })}
      </div>
    </div>
  )
}

function parseTimeToMinutes(time: string): number {
  const [timeStr, period] = time.split(" ")
  const [hourStr, minStr] = timeStr.split(":")
  let hour = Number.parseInt(hourStr)
  const minutes = Number.parseInt(minStr || "0")
  if (period === "PM" && hour !== 12) hour += 12
  if (period === "AM" && hour === 12) hour = 0
  return hour * 60 + minutes
}

function isHalfHourSlot(time: string): boolean {
  return time.includes(":30")
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
  onToggleStepComplete?: (slotId: string, stepId: string) => void
  onResize?: (slotId: string, newDuration: number) => void
  isDropTarget: boolean
  isCurrentSlot: boolean
  slotPassed: boolean
  isHalfHour: boolean
}

const TimeSlot = memo(function TimeSlot({
  slot,
  slotIndex,
  totalSlots,
  onDrop,
  onRemove,
  onToggleComplete,
  onToggleStepComplete,
  onResize,
  isDropTarget,
  isCurrentSlot,
  slotPassed,
  isHalfHour,
}: TimeSlotProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeStartY, setResizeStartY] = useState(0)
  const [currentDuration, setCurrentDuration] = useState(slot.activity?.duration || 1)
  const slotRef = useRef<HTMLDivElement>(null)

  const duration = slot.activity?.duration || 1

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

  // Calculate display duration in 30-min slots (e.g., 2 = 1 hour)
  const durationInMinutes = displayDuration * 30
  const durationLabel = durationInMinutes >= 60
    ? `${durationInMinutes / 60}h`
    : `${durationInMinutes}m`

  return (
    <div
      ref={slotRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`group relative flex items-start gap-4 rounded-2xl border-2 transition-all duration-200 ease-out text-popover ${isCurrentSlot ? "ring-2 ring-primary ring-offset-2" : ""}
        ${isHalfHour && !slot.activity ? "py-1.5 px-3 border-dashed" : "p-3 border-dashed"}
        ${
          slot.activity
            ? "border-transparent bg-secondary"
            : isDragOver
              ? "border-primary bg-primary/5 scale-[1.02]"
              : isDropTarget
                ? "border-border/60 bg-secondary/50"
                : isHalfHour
                  ? "border-transparent bg-transparent"
                  : "border-transparent bg-secondary/30"
        }
      `}
      style={{
        minHeight: slot.activity ? `${displayDuration * 32 + (displayDuration - 1) * 4}px` : undefined,
      }}
    >
      {isCurrentSlot && <div className="absolute -left-1 top-4 h-3 w-3 rounded-full bg-primary animate-pulse" />}

      {/* Time */}
      <span
        className={`w-20 shrink-0 font-mono pt-1 ${isHalfHour ? "text-[10px]" : "text-xs"} ${slotPassed ? "text-muted-foreground/50" : "text-muted-foreground"}`}
      >
        {slot.time}
        {slot.activity && displayDuration > 1 && (
          <span className="block text-[10px] text-muted-foreground/70">{durationLabel}</span>
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
                {slot.activity.steps && slot.activity.steps.length > 0 && (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary">
                    {Object.values(slot.stepCompletions || {}).filter(Boolean).length}/{slot.activity.steps.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => onRemove(slot.id)}
                className="opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity min-w-[44px] min-h-[44px] p-2 rounded-full hover:bg-destructive/10"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </button>
            </div>

            {/* Routine Steps */}
            {slot.activity.steps && slot.activity.steps.length > 0 && (
              <div className="mt-2 space-y-1 border-t border-border/30 pt-2">
                {slot.activity.steps.map((step) => {
                  const isStepComplete = slot.stepCompletions?.[step.id] ?? false
                  return (
                    <button
                      key={step.id}
                      onClick={() => onToggleStepComplete?.(slot.id, step.id)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left hover:bg-secondary/50 transition-colors"
                    >
                      <div
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                          isStepComplete ? "border-green-500 bg-green-500 text-white" : "border-border"
                        }`}
                      >
                        {isStepComplete && <Check className="h-3 w-3" />}
                      </div>
                      <span
                        className={`font-mono text-[11px] ${
                          isStepComplete ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {step.label}
                      </span>
                    </button>
                  )
                })}
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
          <div className={`flex items-center justify-center ${isHalfHour ? "h-5" : "h-9"}`}>
            {isDragOver ? (
              <span className="font-mono text-xs text-primary animate-pulse">drop here</span>
            ) : (
              <div
                className={`h-px w-full ${slotPassed ? "bg-border/30" : "bg-border/50"}`}
                style={isHalfHour ? { backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 4px, currentColor 4px, currentColor 8px)", backgroundColor: "transparent", opacity: 0.3 } : undefined}
              />
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
