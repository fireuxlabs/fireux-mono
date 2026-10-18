import type { WeekdayTimeWindowsConfig } from '../../models/shared/weekday-time.model'
import type { KitchenOffering } from '../models/offering.model'
import { weekdayTimeDays } from '../../utils/weekday-time'

/** Resolve inheritance for presentation; never copy the parent into stored service settings. */
export function resolveServiceHours(
  offerings: KitchenOffering[],
  kitchenHours: WeekdayTimeWindowsConfig
): KitchenOffering[] {
  return offerings.map((offering) => ({
    ...offering,
    hours: offering.hours_source === 'custom' ? offering.hours : kitchenHours,
  }))
}

/** Weekly ranges can be split or overnight, but must remain inside their parent. */
export function hoursWithinParent(
  hours: WeekdayTimeWindowsConfig,
  parent: WeekdayTimeWindowsConfig
): boolean {
  if (!parent.windows.length || hours.timezone !== parent.timezone) return false
  const week = 7 * 24 * 60
  const minutes = (value: string) => {
    const [h, m] = value.split(':').map(Number)
    return h! * 60 + m!
  }
  const intervals = (config: WeekdayTimeWindowsConfig) =>
    config.windows.flatMap((window) =>
      window.days.flatMap((day) => {
        const start = weekdayTimeDays.indexOf(day) * 1440 + minutes(window.open)
        let length = minutes(window.close) - minutes(window.open)
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
  const allowed = intervals(parent).sort((a, b) => a[0]! - b[0]!)
  return intervals(hours).every(([start, end]) => {
    let covered = start!
    for (const [from, until] of allowed) {
      if (from! > covered) break
      if (until! > covered) covered = until!
      if (covered >= end!) return true
    }
    return false
  })
}
