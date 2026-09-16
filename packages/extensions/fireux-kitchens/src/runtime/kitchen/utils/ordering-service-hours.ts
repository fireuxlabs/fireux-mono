import type { KitchenServiceHoursConfig } from '../models/ordering.model'
import type { WeekdayTimeWindowsConfig } from '../../models/shared/weekday-time.model.ts'
import { readWeekdayTimeWindowsConfig } from '../../utils/weekday-time'

const hasWindows = (value?: WeekdayTimeWindowsConfig) =>
  Boolean(value?.windows.length)
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
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

export const compactKitchenServiceHours = (
  value: unknown
): KitchenServiceHoursConfig | undefined => {
  const serviceHours = record(value)
  if (serviceHours.inherit_kitchen_operation_hours === true) return undefined

  const operationHours = record(serviceHours.operation_hours)
  const customIntent =
    serviceHours.inherit_kitchen_operation_hours === false ||
    Object.hasOwn(serviceHours, 'operation_hours')
  if (!customIntent) return undefined

  const timezone = text(operationHours.timezone)
  const windows = Array.isArray(operationHours.windows)
    ? operationHours.windows
    : []
  if (!timezone || !validTimezone(timezone) || !windows.length) {
    throw new Error('Custom service hours require a timezone and valid ranges.')
  }

  const normalized = readWeekdayTimeWindowsConfig({
    ...operationHours,
    source: 'custom',
    timezone,
  })
  if (normalized.windows.length !== windows.length) {
    throw new Error('Custom service hours contain an invalid range.')
  }

  return {
    inherit_kitchen_operation_hours: false,
    operation_hours: normalized,
  }
}

const inheritedHours = (
  config: KitchenServiceHoursConfig,
  parent?: WeekdayTimeWindowsConfig
): KitchenServiceHoursConfig => ({
  ...config,
  operation_hours: hasWindows(parent) ? parent : undefined,
})

export const resolveKitchenServiceHours = (
  config: KitchenServiceHoursConfig | undefined,
  kitchenHours?: WeekdayTimeWindowsConfig
): KitchenServiceHoursConfig | undefined => {
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
