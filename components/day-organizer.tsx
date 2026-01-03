"use client"

import { useState, useEffect } from "react"
import { ActivityPalette } from "./activity-palette"
import { ScheduleBoard } from "./schedule-board"
import { CustomBlockCreator } from "./custom-block-creator"
import { WeekView } from "./week-view"
import { MonthView } from "./month-view"
import { YearView } from "./year-view"
import { ViewSwitcher } from "./view-switcher"
import type { ActivityBlock, DaySchedule, ViewMode } from "@/lib/types"
import { SketchPuzzleIcon } from "./sketch-puzzle-icon"
import { SketchCalendarIcon } from "./sketch-calendar-icon"
import { useLocalStorage } from "@/lib/use-local-storage"

const defaultActivities: ActivityBlock[] = [
  { id: "workout-equinox", label: "Workout - Equinox", icon: "barbell", color: "#E15B8C" }, // Pink
  { id: "workout-fitness-sf", label: "Workout - Fitness SF", icon: "barbell", color: "#E17C5B" }, // Orange
  { id: "commute-waymo", label: "Commute - Waymo", icon: "car", color: "#5BB8E1" }, // Cyan
  { id: "commute-bus", label: "Commute - Bus", icon: "bus", color: "#7C5CE0" }, // Purple
  { id: "clean", label: "Clean", icon: "sparkles", color: "#5BE17C" }, // Green
  { id: "elliot", label: "Take Elliot Out", icon: "dog", color: "#E1B85B" }, // Yellow
  { id: "work-focus", label: "Work/Deep Focus", icon: "focus", color: "#5B6EE1" }, // Blue
  { id: "read-write-build", label: "Read/Write/Build", icon: "create", color: "#8B5CF6" }, // Violet
]

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

function getPSTDate(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }))
}

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0]
}

function createEmptySchedule(dateKey: string): DaySchedule {
  return {
    date: dateKey,
    slots: timeSlots.map((time, index) => ({
      id: `${dateKey}-slot-${index}`,
      time,
      activity: null,
      completed: false,
      isContinuation: false,
      parentSlotId: undefined,
    })),
  }
}

export function DayOrganizer() {
  const [activities, setActivities] = useLocalStorage<ActivityBlock[]>("day-organizer-activities", defaultActivities)
  const [schedulesByDate, setSchedulesByDate] = useLocalStorage<Record<string, DaySchedule>>(
    "day-organizer-schedules",
    {},
  )

  const [viewMode, setViewMode] = useState<ViewMode>("day")
  const [currentPSTTime, setCurrentPSTTime] = useState<Date>(getPSTDate())
  const [selectedDate, setSelectedDate] = useState<Date>(getPSTDate())
  const [draggedActivity, setDraggedActivity] = useState<ActivityBlock | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPSTTime(getPSTDate())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const selectedDateKey = formatDateKey(selectedDate)
  const currentSchedule = schedulesByDate[selectedDateKey] || createEmptySchedule(selectedDateKey)

  const handleDragStart = (activity: ActivityBlock) => {
    setDraggedActivity(activity)
  }

  const handleDragEnd = () => {
    setDraggedActivity(null)
  }

  const handleDrop = (slotId: string, duration = 1) => {
    if (draggedActivity) {
      setSchedulesByDate((prev) => {
        const schedule = prev[selectedDateKey] || createEmptySchedule(selectedDateKey)
        const slotIndex = schedule.slots.findIndex((s) => s.id === slotId)
        if (slotIndex === -1) return prev

        const newSlots = schedule.slots.map((slot, index) => {
          if (slot.id === slotId) {
            return {
              ...slot,
              activity: { ...draggedActivity, instanceId: `${draggedActivity.id}-${Date.now()}`, duration },
              isContinuation: false,
              parentSlotId: undefined,
            }
          }
          if (index > slotIndex && index < slotIndex + duration) {
            return {
              ...slot,
              activity: null,
              isContinuation: true,
              parentSlotId: slotId,
              completed: false,
            }
          }
          if (slot.parentSlotId === slotId) {
            return { ...slot, isContinuation: false, parentSlotId: undefined }
          }
          return slot
        })

        return {
          ...prev,
          [selectedDateKey]: { ...schedule, slots: newSlots },
        }
      })
    }
  }

  const handleDropOnDate = (dateKey: string, slotId: string, activity: ActivityBlock, duration = 1) => {
    setSchedulesByDate((prev) => {
      const schedule = prev[dateKey] || createEmptySchedule(dateKey)
      const slotIndex = schedule.slots.findIndex((s) => s.id === slotId)
      if (slotIndex === -1) return prev

      const newSlots = schedule.slots.map((slot, index) => {
        if (slot.id === slotId) {
          return {
            ...slot,
            activity: { ...activity, instanceId: `${activity.id}-${Date.now()}`, duration },
            isContinuation: false,
            parentSlotId: undefined,
          }
        }
        if (index > slotIndex && index < slotIndex + duration) {
          return {
            ...slot,
            activity: null,
            isContinuation: true,
            parentSlotId: slotId,
            completed: false,
          }
        }
        if (slot.parentSlotId === slotId) {
          return { ...slot, isContinuation: false, parentSlotId: undefined }
        }
        return slot
      })

      return {
        ...prev,
        [dateKey]: { ...schedule, slots: newSlots },
      }
    })
  }

  const handleRemoveActivity = (slotId: string) => {
    setSchedulesByDate((prev) => {
      const schedule = prev[selectedDateKey]
      if (!schedule) return prev
      return {
        ...prev,
        [selectedDateKey]: {
          ...schedule,
          slots: schedule.slots.map((slot) => {
            if (slot.id === slotId) {
              return { ...slot, activity: null, completed: false, isContinuation: false, parentSlotId: undefined }
            }
            if (slot.parentSlotId === slotId) {
              return { ...slot, isContinuation: false, parentSlotId: undefined }
            }
            return slot
          }),
        },
      }
    })
  }

  const handleRemoveActivityFromDate = (dateKey: string, slotId: string) => {
    setSchedulesByDate((prev) => {
      const schedule = prev[dateKey]
      if (!schedule) return prev
      return {
        ...prev,
        [dateKey]: {
          ...schedule,
          slots: schedule.slots.map((slot) => {
            if (slot.id === slotId) {
              return { ...slot, activity: null, completed: false, isContinuation: false, parentSlotId: undefined }
            }
            if (slot.parentSlotId === slotId) {
              return { ...slot, isContinuation: false, parentSlotId: undefined }
            }
            return slot
          }),
        },
      }
    })
  }

  const handleResize = (slotId: string, newDuration: number) => {
    setSchedulesByDate((prev) => {
      const schedule = prev[selectedDateKey]
      if (!schedule) return prev

      const slotIndex = schedule.slots.findIndex((s) => s.id === slotId)
      if (slotIndex === -1) return prev

      const currentSlot = schedule.slots[slotIndex]
      if (!currentSlot.activity) return prev

      const oldDuration = currentSlot.activity.duration || 1

      const newSlots = schedule.slots.map((slot, index) => {
        if (slot.id === slotId) {
          return {
            ...slot,
            activity: { ...slot.activity!, duration: newDuration },
          }
        }
        if (slot.parentSlotId === slotId && index >= slotIndex + newDuration) {
          return { ...slot, isContinuation: false, parentSlotId: undefined }
        }
        if (index > slotIndex && index < slotIndex + newDuration && !slot.activity) {
          return { ...slot, isContinuation: true, parentSlotId: slotId }
        }
        return slot
      })

      return {
        ...prev,
        [selectedDateKey]: { ...schedule, slots: newSlots },
      }
    })
  }

  const handleResizeOnDate = (dateKey: string, slotId: string, newDuration: number) => {
    setSchedulesByDate((prev) => {
      const schedule = prev[dateKey]
      if (!schedule) return prev

      const slotIndex = schedule.slots.findIndex((s) => s.id === slotId)
      if (slotIndex === -1) return prev

      const currentSlot = schedule.slots[slotIndex]
      if (!currentSlot.activity) return prev

      const newSlots = schedule.slots.map((slot, index) => {
        if (slot.id === slotId) {
          return {
            ...slot,
            activity: { ...slot.activity!, duration: newDuration },
          }
        }
        if (slot.parentSlotId === slotId && index >= slotIndex + newDuration) {
          return { ...slot, isContinuation: false, parentSlotId: undefined }
        }
        if (index > slotIndex && index < slotIndex + newDuration && !slot.activity) {
          return { ...slot, isContinuation: true, parentSlotId: slotId }
        }
        return slot
      })

      return {
        ...prev,
        [dateKey]: { ...schedule, slots: newSlots },
      }
    })
  }

  const handleToggleComplete = (slotId: string) => {
    setSchedulesByDate((prev) => {
      const schedule = prev[selectedDateKey]
      if (!schedule) return prev
      return {
        ...prev,
        [selectedDateKey]: {
          ...schedule,
          slots: schedule.slots.map((slot) => (slot.id === slotId ? { ...slot, completed: !slot.completed } : slot)),
        },
      }
    })
  }

  const handleToggleCompleteOnDate = (dateKey: string, slotId: string) => {
    setSchedulesByDate((prev) => {
      const schedule = prev[dateKey]
      if (!schedule) return prev
      return {
        ...prev,
        [dateKey]: {
          ...schedule,
          slots: schedule.slots.map((slot) => (slot.id === slotId ? { ...slot, completed: !slot.completed } : slot)),
        },
      }
    })
  }

  const handleAddCustomBlock = (block: ActivityBlock) => {
    setActivities((prev) => [...prev, block])
  }

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date)
    setViewMode("day")
  }

  const handleWeekChange = (date: Date) => {
    setSelectedDate(date)
  }

  const getCompletionStats = (dateKey: string) => {
    const schedule = schedulesByDate[dateKey]
    if (!schedule) return { total: 0, completed: 0, ratio: 0 }
    const slotsWithActivities = schedule.slots.filter((s) => s.activity && !s.isContinuation)
    const completed = slotsWithActivities.filter((s) => s.completed).length
    return {
      total: slotsWithActivities.length,
      completed,
      ratio: slotsWithActivities.length > 0 ? completed / slotsWithActivities.length : 0,
    }
  }

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-6xl flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 font-mono text-sm text-muted-foreground">loading your schedule...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mb-2 inline-flex items-center gap-2">
          <SketchCalendarIcon className="h-8 w-8 text-primary" />
          <h1 className="font-mono text-2xl tracking-wide text-foreground">organize my life</h1>
        </div>
        <p className="font-mono text-sm text-muted-foreground">Here's the plan...</p>

        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 shadow-sm">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-mono text-xs text-muted-foreground">
            {currentPSTTime.toLocaleString("en-US", {
              timeZone: "America/Los_Angeles",
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}{" "}
            PST
          </span>
        </div>
      </div>

      <ViewSwitcher viewMode={viewMode} onViewChange={setViewMode} />

      {viewMode === "day" && (
        <div className="flex flex-col gap-6">
          {/* Activities Panel - now at top */}
          <div className="rounded-3xl bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SketchPuzzleIcon className="h-5 w-5 text-primary" />
                <h2 className="font-mono text-sm tracking-wide text-foreground">activities</h2>
              </div>
              <CustomBlockCreator onAddBlock={handleAddCustomBlock} compact />
            </div>
            <ActivityPalette activities={activities} onDragStart={handleDragStart} onDragEnd={handleDragEnd} inline />
          </div>

          {/* Schedule Board - now below */}
          <ScheduleBoard
            schedule={currentSchedule.slots}
            selectedDate={selectedDate}
            currentTime={currentPSTTime}
            onDrop={handleDrop}
            onRemove={handleRemoveActivity}
            onToggleComplete={handleToggleComplete}
            onResize={handleResize}
            draggedActivity={draggedActivity}
            onDateChange={setSelectedDate}
          />
        </div>
      )}

      {viewMode === "week" && (
        <WeekView
          currentDate={selectedDate}
          schedulesByDate={schedulesByDate}
          activities={activities}
          getCompletionStats={getCompletionStats}
          onSelectDate={handleSelectDate}
          onDropActivity={handleDropOnDate}
          onRemoveActivity={handleRemoveActivityFromDate}
          onToggleComplete={handleToggleCompleteOnDate}
          onWeekChange={handleWeekChange}
          onAddCustomBlock={handleAddCustomBlock}
          onResizeActivity={handleResizeOnDate}
        />
      )}

      {viewMode === "month" && (
        <MonthView
          currentDate={selectedDate}
          schedulesByDate={schedulesByDate}
          getCompletionStats={getCompletionStats}
          onSelectDate={handleSelectDate}
          onMonthChange={setSelectedDate}
        />
      )}

      {viewMode === "year" && (
        <YearView
          currentDate={selectedDate}
          schedulesByDate={schedulesByDate}
          getCompletionStats={getCompletionStats}
          onSelectDate={handleSelectDate}
          onYearChange={setSelectedDate}
        />
      )}
    </div>
  )
}
