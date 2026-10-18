import { normalizeKitchenOfferings } from '../../kitchen/utils/offering-policy'
import { readWeekdayTimeWindowsConfig } from '../../utils/weekday-time'
import { intersectWeekdayHours } from '../../utils/weekday-time-constraints'

/** A Menu may narrow a service window; it cannot extend it. */
export function constrainMenuOfferings(value: unknown, menuHours: unknown) {
  const offerings = normalizeKitchenOfferings(value)
  if (!menuHours) return offerings
  const own = readWeekdayTimeWindowsConfig(menuHours)
  return offerings.map((offering) => ({
    ...offering,
    hours: offering.hours
      ? intersectWeekdayHours(own, offering.hours)
      : undefined,
  }))
}
