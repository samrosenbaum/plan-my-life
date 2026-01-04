"use client"

import { useState } from "react"
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ScheduleBoard } from "./schedule-board"
import { ActivityPalette } from "./activity-palette"
import { CustomBlockCreator } from "./custom-block-creator"
import { WeekView } from "./week-view"
import { MonthView } from "./month-view"
import { YearView } from "./year-view"
import { ViewSwitcher } from "./view-switcher"
import { WeatherDisplay } from "./weather-display"
import type { Activity, ScheduledActivity, ViewType } from "@/lib/types"
import { useLocalStorage } from "@/lib/use-local-storage"

const DEFAULT_ACTIVITIES: Activity[] = [
  { id: "workout-equinox", label: "Workout - Equinox", icon: "dumbbell", color: "pink" },
  { id: "workout-fitness-sf", label: "Workout - Fitness SF", icon: "dumbbell", color: "orange" },
  { id: "commute-waymo", label: "Commute - Waymo", icon: "car", color: "cyan" },
  { id: "commute-bus", label: "Commute - Bus", icon: "bus", color: "purple" },
  { id: "clean", label: "Clean", icon: "sparkles", color: "green" },
  { id: "take-elliot-out", label: "Take Elliot Out", icon: "dog", color: "yellow" },
  { id: "work-focus", label: "Work/Deep Focus", icon: "target", color: "blue" },
  { id: "read-write-build", label: "Read/Write/Build", icon: "pencil", color: "violet" },
]

export function DayOrganizer() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<ViewType>("day")
  const [customActivities, setCustomActivities] = useLocalStorage<Activity[]>("custom-activities", [])
  const [scheduledActivities, setScheduledActivities] = useLocalStorage<ScheduledActivity[]>("scheduled-activities", [])

  const allActivities = [...DEFAULT_ACTIVITIES, ...customActivities]

  const handleAddCustomActivity = (activity: Activity) => {
    setCustomActivities([...customActivities, activity])
  }

  const handleScheduleActivity = (activity: Activity, timeSlot: number, date?: Date) => {
    const targetDate = date || currentDate
    const dateKey = format(targetDate, "yyyy-MM-dd")

    const newScheduled: ScheduledActivity = {
      ...activity,
      scheduledId: `${activity.id}-${dateKey}-${timeSlot}-${Date.now()}`,
      timeSlot,
      date: dateKey,
      completed: false,
      duration: 1,
    }

    setScheduledActivities([...scheduledActivities, newScheduled])
  }

  const handleRemoveActivity = (scheduledId: string) => {
    setScheduledActivities(scheduledActivities.filter((a) => a.scheduledId !== scheduledId))
  }

  const handleToggleComplete = (scheduledId: string) => {
    setScheduledActivities(
      scheduledActivities.map((a) => (a.scheduledId === scheduledId ? { ...a, completed: !a.completed } : a)),
    )
  }

  const handleResizeActivity = (scheduledId: string, newDuration: number) => {
    setScheduledActivities(
      scheduledActivities.map((a) => (a.scheduledId === scheduledId ? { ...a, duration: newDuration } : a)),
    )
  }

  const todayDate = format(new Date(), "yyyy-MM-dd")
  const currentDateKey = format(currentDate, "yyyy-MM-dd")
  const isToday = todayDate === currentDateKey

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 0 })
  const isCurrentWeek = format(weekStart, "yyyy-MM-dd") === format(currentWeekStart, "yyyy-MM-dd")

  const navigateDay = (direction: "prev" | "next") => {
    setCurrentDate(addDays(currentDate, direction === "next" ? 1 : -1))
  }

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentDate(direction === "next" ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="min-h-screen bg-[#e8e8e8] p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-mono text-2xl font-bold text-[#4a4adc] md:text-3xl">Day Organizer</h1>
            <p className="font-mono text-sm text-gray-600">plan your puzzle pieces</p>
          </div>
          <ViewSwitcher currentView={view} onViewChange={setView} />
        </div>

        {view === "day" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between rounded-2xl border-2 border-dashed border-[#4a4adc]/30 bg-white/60 p-4">
              <button
                onClick={() => navigateDay("prev")}
                className="rounded-full p-2 text-[#4a4adc] transition-colors hover:bg-[#4a4adc]/10"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex flex-col items-center gap-2">
                <div className="font-mono text-lg font-bold text-[#4a4adc]">
                  {format(currentDate, "EEEE, MMMM d, yyyy")}
                </div>
                {!isToday && (
                  <button
                    onClick={goToToday}
                    className="rounded-full border border-[#4a4adc]/30 bg-white px-3 py-1 font-mono text-xs text-[#4a4adc] transition-colors hover:bg-[#4a4adc]/10"
                  >
                    today
                  </button>
                )}
              </div>

              <button
                onClick={() => navigateDay("next")}
                className="rounded-full p-2 text-[#4a4adc] transition-colors hover:bg-[#4a4adc]/10"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <WeatherDisplay date={currentDate} view="day" />

            <div className="flex flex-col gap-4">
              <ActivityPalette
                activities={allActivities}
                onSchedule={(activity, timeSlot) => handleScheduleActivity(activity, timeSlot)}
                inline
              />
              <CustomBlockCreator onAdd={handleAddCustomActivity} compact />
            </div>

            <ScheduleBoard
              date={currentDate}
              scheduledActivities={scheduledActivities.filter((a) => a.date === currentDateKey)}
              onRemove={handleRemoveActivity}
              onToggleComplete={handleToggleComplete}
              onResize={handleResizeActivity}
            />
          </div>
        )}

        {view === "week" && (
          <WeekView
            weekStart={weekStart}
            scheduledActivities={scheduledActivities}
            activities={allActivities}
            onSchedule={handleScheduleActivity}
            onRemove={handleRemoveActivity}
            onToggleComplete={handleToggleComplete}
            onNavigate={navigateWeek}
            onGoToToday={goToToday}
            onAddCustomActivity={handleAddCustomActivity}
            onResize={handleResizeActivity}
            isCurrentWeek={isCurrentWeek}
            onDayClick={(date) => {
              setCurrentDate(date)
              setView("day")
            }}
          />
        )}

        {view === "month" && <MonthView currentDate={currentDate} scheduledActivities={scheduledActivities} />}

        {view === "year" && <YearView currentDate={currentDate} scheduledActivities={scheduledActivities} />}
      </div>
    </div>
  )
}
