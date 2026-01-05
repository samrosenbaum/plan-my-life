export interface RoutineStep {
  id: string
  label: string
}

export interface ActivityBlock {
  id: string
  label: string
  icon: string
  color: string
  instanceId?: string
  duration?: number // Number of time slots (default 1 = 1 hour)
  steps?: RoutineStep[] // Optional steps for routines
}

export interface ScheduleSlot {
  id: string
  time: string
  activity: ActivityBlock | null
  completed: boolean
  isContinuation?: boolean // Track if this slot is a continuation of a multi-hour activity
  parentSlotId?: string
  stepCompletions?: Record<string, boolean> // Track completion of routine steps by step ID
}

export interface DaySchedule {
  date: string // YYYY-MM-DD format
  slots: ScheduleSlot[]
}

export type ViewMode = "essentials" | "day" | "week" | "month" | "year"
