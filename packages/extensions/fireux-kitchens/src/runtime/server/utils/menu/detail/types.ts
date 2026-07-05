import type { MenuOrderFulfilmentPolicy } from '../../../../models/kitchen/menu/menu.model'
import type { WeekdayTimeWindowsConfig } from '../../../../models/shared/weekday-time.model'

export type MenuDetailScope = {
  kitchenId?: string
  kitchenSlug?: string
  kitchenName?: string
  kitchenAppId?: string
  kitchenMenuId?: string
  sourceKind?: string
  page_style?: Record<string, unknown>
  choices?: unknown[]
  sections?: unknown[]
  sourceMenu?: Record<string, unknown>
  fulfilment?: MenuOrderFulfilmentPolicy
  kitchen_operation_hours?: WeekdayTimeWindowsConfig
}

export type MenuDetailFile = {
  url?: string
  name?: string
  type?: string
  storage_path?: string
}

export type MenuDetailSource = {
  app_id?: string
  kitchen_id?: string
  kitchen_slug?: string
  kitchen_name?: string
  menu_id?: string
}

export type MenuDetailSourceKind = 'doc' | 'menu'

export const menuDetailText = (value: unknown) =>
  String(value ?? '').trim()

export const compactMenuDetailRecord = <T extends Record<string, unknown>>(
  value: T
) =>
  Object.fromEntries(
    Object.entries(value).filter(([, entry]) =>
      Boolean(menuDetailText(entry))
    )
  ) as Partial<T>
