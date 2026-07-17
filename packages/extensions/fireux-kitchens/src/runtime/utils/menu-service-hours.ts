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
  if (!config) return undefined
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
  if (!config) return undefined
  if (config.inherit_menu_service_hours) {
    return inheritedHours(config, menuHours)
  }
  if (config.inherit_kitchen_operation_hours) {
    return inheritedHours(config, kitchenHours)
  }

  return config
}
