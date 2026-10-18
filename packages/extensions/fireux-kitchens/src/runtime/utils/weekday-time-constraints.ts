import type {
  WeekdayTimeWindowsConfig,
  WeekdayTimeDay,
} from '../models/shared/weekday-time.model'
import { weekdayTimeDays } from './weekday-time'
const week = 7 * 1440
const minute = (time: string) =>
  Number(time.slice(0, 2)) * 60 + Number(time.slice(3))
function intervals(hours: WeekdayTimeWindowsConfig) {
  const ranges = hours.windows
    .flatMap((window) =>
      window.days.flatMap((day) => {
        const start = weekdayTimeDays.indexOf(day) * 1440 + minute(window.open)
        let length = minute(window.close) - minute(window.open)
        if (length <= 0) length += 1440
        const end = start + length
        return end > week
          ? [
              [start, week],
              [0, end - week],
            ]
          : [[start, end]]
      })
    )
    .sort((a, b) => a[0]! - b[0]!)
  const merged: number[][] = []
  for (const range of ranges) {
    const last = merged.at(-1)
    if (last && range[0]! <= last[1]!) last[1] = Math.max(last[1]!, range[1]!)
    else merged.push([...range])
  }
  return merged
}
export function weekdayHoursWithin(
  child: WeekdayTimeWindowsConfig,
  parent: WeekdayTimeWindowsConfig
): boolean {
  if (child.timezone !== parent.timezone) return false
  const allowed = intervals(parent)
  return intervals(child).every(([start, end]) =>
    allowed.some(([from, until]) => from! <= start! && until! >= end!)
  )
}
/** Effective availability is the intersection; stored schedules remain untouched. */
export function intersectWeekdayHours(
  child: WeekdayTimeWindowsConfig,
  parent: WeekdayTimeWindowsConfig
): WeekdayTimeWindowsConfig {
  const empty: WeekdayTimeWindowsConfig = {
    source: 'custom',
    timezone: parent.timezone,
    windows: [],
  }
  if (child.timezone !== parent.timezone) return empty
  if (weekdayHoursWithin(child, parent))
    return {
      ...child,
      windows: child.windows.map((window) => ({
        ...window,
        days: [...window.days],
      })),
    }
  const clock = (value: number) =>
    `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`
  const groups = new Map<
    string,
    { days: WeekdayTimeDay[]; open: string; close: string }
  >()
  for (const [start, end] of intervals(child))
    for (const [from, until] of intervals(parent)) {
      let cursor = Math.max(start!, from!)
      const stop = Math.min(end!, until!)
      while (cursor < stop) {
        const day = Math.floor(cursor / 1440)
        const next = Math.min(stop, (day + 1) * 1440)
        const open = clock(cursor % 1440),
          close = clock(next % 1440)
        const key = `${open}:${close}`
        const group = groups.get(key) || { days: [], open, close }
        if (!group.days.includes(weekdayTimeDays[day]!))
          group.days.push(weekdayTimeDays[day]!)
        groups.set(key, group)
        cursor = next
      }
    }
  return { ...empty, windows: [...groups.values()] }
}
