// Concurrent edit — 2026-07-20 16:24 CEST — Pre-order planning repair: make missing child schedules inherit through the canonical Kitchen → Menu → surface chain.
// Concurrent edit — 2026-07-20 21:19 CEST — Place-root authority pass: persist only valid custom Menu-hours deltas.
import type { MenuServiceHoursConfig } from '../models/kitchen-menu.model.ts'
import type { WeekdayTimeWindowsConfig } from '../../models/shared/weekday-time.model.ts'
import { readWeekdayTimeWindowsConfig } from '../../utils/weekday-time'

const hasWindows = (value?: WeekdayTimeWindowsConfig) =>
  Boolean(value?.windows.length)
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const text = (value: unknown) => String(value ?? '').trim()
const validTimezone = (value: string) => {
  try {
    new Intl.DateTimeFormat('en', { timeZone: value }).format()
    return true
  } catch {
    return false
  }
}

export const compactMenuServiceHoursDelta = (
  value: unknown
): MenuServiceHoursConfig | undefined => {
  const serviceHours = record(value)
  if (serviceHours.inherit_kitchen_operation_hours === true) return undefined

  const operationHours = record(serviceHours.operation_hours)
  const customIntent = serviceHours.inherit_kitchen_operation_hours === false ||
    Object.hasOwn(serviceHours, 'operation_hours')
  if (!customIntent) return undefined

  const timezone = text(operationHours.timezone)
  const windows = Array.isArray(operationHours.windows)
    ? operationHours.windows
    : []
  if (!timezone || !validTimezone(timezone) || !windows.length) {
    throw new Error('Custom Menu service hours require a timezone and valid ranges.')
  }

  const normalized = readWeekdayTimeWindowsConfig({
    ...operationHours,
    source: 'custom',
    timezone,
  })
  if (normalized.windows.length !== windows.length) {
    throw new Error('Custom Menu service hours contain an invalid range.')
  }

  return {
    inherit_kitchen_operation_hours: false,
    operation_hours: normalized,
  }
}

const inheritedHours = (
  config: MenuServiceHoursConfig,
  parent?: WeekdayTimeWindowsConfig
): MenuServiceHoursConfig => ({
  ...config,
  operation_hours: hasWindows(parent) ? parent : undefined,
})

export const resolveMenuServiceHours = (
  config: MenuServiceHoursConfig | undefined,
  kitchenHours?: WeekdayTimeWindowsConfig
): MenuServiceHoursConfig | undefined => {
  if (!config) {
    return hasWindows(kitchenHours)
      ? inheritedHours({ inherit_kitchen_operation_hours: true }, kitchenHours)
      : undefined
  }
  if (config.inherit_kitchen_operation_hours) {
    return inheritedHours(config, kitchenHours)
  }

  return config
}

export const resolveMenuSurfaceServiceHours = (
  config: MenuServiceHoursConfig | undefined,
  menuHours?: WeekdayTimeWindowsConfig,
  kitchenHours?: WeekdayTimeWindowsConfig
): MenuServiceHoursConfig | undefined => {
  if (!config) {
    if (hasWindows(menuHours)) {
      return inheritedHours({ inherit_menu_service_hours: true }, menuHours)
    }

    return hasWindows(kitchenHours)
      ? inheritedHours({ inherit_kitchen_operation_hours: true }, kitchenHours)
      : undefined
  }
  if (config.inherit_menu_service_hours) {
    return inheritedHours(config, menuHours)
  }
  if (config.inherit_kitchen_operation_hours) {
    return inheritedHours(config, kitchenHours)
  }

  return config
}
