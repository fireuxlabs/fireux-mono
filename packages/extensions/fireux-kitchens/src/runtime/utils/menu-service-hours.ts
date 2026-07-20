// Concurrent edit — 2026-07-20 16:24 CEST — Pre-order planning repair: make missing child schedules inherit through the canonical Kitchen → Menu → surface chain.
import type { MenuServiceHoursConfig } from '../models/kitchen/menu/kitchen-menu.model'
import type { WeekdayTimeWindowsConfig } from '../models/shared/weekday-time.model'

const hasWindows = (value?: WeekdayTimeWindowsConfig) =>
  Boolean(value?.windows.length)

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
