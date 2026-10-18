import type { WeekdayTimeWindowsConfig } from '../../models/shared/weekday-time.model'
import type { KitchenOffering } from '../models/offering.model'
import {
  intersectWeekdayHours,
  weekdayHoursWithin,
} from '../../utils/weekday-time-constraints'
import { weekdayTimeDays } from '../../utils/weekday-time'

/** Resolve inheritance for presentation; never copy the parent into stored service settings. */
export function resolveServiceHours(
  offerings: KitchenOffering[],
  kitchenHours: WeekdayTimeWindowsConfig
): KitchenOffering[] {
  return offerings.map((offering) => ({
    ...offering,
    hours:
      offering.hours_source === 'custom'
        ? offering.hours
          ? intersectWeekdayHours(offering.hours, kitchenHours)
          : undefined
        : kitchenHours,
  }))
}

/** Weekly ranges can be split or overnight, but must remain inside their parent. */
export function hoursWithinParent(
  hours: WeekdayTimeWindowsConfig,
  parent: WeekdayTimeWindowsConfig
): boolean {
  return weekdayHoursWithin(hours, parent)
}

/** Compact display of equivalent ranges without implying service on omitted days. */
export function serviceHoursSummary(
  hours?: WeekdayTimeWindowsConfig | null
): string[] {
  const groups = new Map<string, Set<string>>()
  for (const window of hours?.windows || []) {
    const time = `${window.open}–${window.close}`
    const days = groups.get(time) || new Set<string>()
    window.days.forEach((day) => days.add(day))
    groups.set(time, days)
  }
  return [...groups].map(([time, days]) => {
    const ordered = weekdayTimeDays.filter((day) => days.has(day))
    const indexes = ordered.map((day) => weekdayTimeDays.indexOf(day))
    const consecutive = indexes.every(
      (day, index) => !index || day === indexes[index - 1]! + 1
    )
    const short = ordered.map((day) =>
      day.slice(0, 3).replace(/^./, (letter) => letter.toUpperCase())
    )
    const label =
      consecutive && short.length > 2
        ? `${short[0]}–${short.at(-1)}`
        : short.join(', ')
    return `${label}  ${time}`
  })
}
