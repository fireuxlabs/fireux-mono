/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Model support
 * Storage: shared runtime model support, not a persisted entity
 * Used by: stored models that need weekly schedules or time windows
 *
 * Decision note:
 * - Weekday, time-window, and weekly schedule shapes are shared primitives.
 * - Domain models may compose these primitives, but should not own them.
 * - The primitive is intentionally neutral: Place may use it for business
 *   hours, Kitchen may use it for service/opening hours, and Menu may use it
 *   for menu availability. The field name on each model carries the meaning.
 */
export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export type TimeWindow = {
  start: string
  end: string
}

export type WeeklyTimeWindows = Partial<Record<Weekday, TimeWindow[]>>

export type WeeklySchedule = {
  timezone: string
  weekly: WeeklyTimeWindows
  notes?: string
}
