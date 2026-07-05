import type { MenuOrderFulfilmentPolicy } from '../../../models/kitchen/menu/menu.model'
import type { MenuRouteContext } from '../../../models/kitchen/menu/menu-context.model'
import type { WeekdayTimeWindowsConfig } from '../../../models/shared/weekday-time.model'

export type MenuPayloadScope = {
  kitchenId?: string
  kitchenSlug?: string
  kitchenName?: string
  kitchenAppId?: string
  kitchenMenuId?: string
  sourceKind?: string
  menuContext?: MenuRouteContext
  page_style?: Record<string, unknown>
  choices?: unknown[]
  sections?: unknown[]
  sourceMenu?: Record<string, unknown>
  fulfilment?: MenuOrderFulfilmentPolicy
  kitchen_operation_hours?: WeekdayTimeWindowsConfig
}

export type MenuPayloadFile = {
  url?: string
  name?: string
  type?: string
  storage_path?: string
}

export type MenuPayloadSource = {
  app_id?: string
  kitchen_id?: string
  kitchen_slug?: string
  kitchen_name?: string
  menu_id?: string
}

export type MenuPayloadSourceKind = 'doc' | 'menu'

export const menuPayloadText = (value: unknown) =>
  String(value ?? '').trim()

export const compactMenuPayloadRecord = <T extends Record<string, unknown>>(
  value: T
) =>
  Object.fromEntries(
    Object.entries(value).filter(([, entry]) =>
      Boolean(menuPayloadText(entry))
    )
  ) as Partial<T>
