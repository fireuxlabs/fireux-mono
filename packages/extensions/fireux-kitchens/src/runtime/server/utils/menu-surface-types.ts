import type { MenuOrderFulfilmentPolicy } from '../../models/menu/menu.model'

export type MenuSurfaceScope = {
  kitchenId?: string
  kitchenSlug?: string
  kitchenName?: string
  kitchenAppId?: string
  kitchenMenuId?: string
  sourceKind?: string
  path?: string
  qrPath?: string
  createdByLabel?: string
  page_style?: Record<string, unknown>
  public_choices?: unknown[]
  sections?: unknown[]
  fulfilment?: MenuOrderFulfilmentPolicy
}

export type MenuSurfaceFile = {
  url?: string
  name?: string
  type?: string
  storage_path?: string
}

export type MenuSurfaceSource = {
  app_id?: string
  kitchen_id?: string
  kitchen_slug?: string
  kitchen_name?: string
  menu_id?: string
}

export type MenuSurfaceKind = 'doc' | 'menu'

export const menuSurfaceText = (value: unknown) =>
  String(value ?? '').trim()

export const menuSurfaceList = (value: unknown) =>
  Array.isArray(value) ? value : []

export const compactMenuSurfaceRecord = <T extends Record<string, unknown>>(
  value: T
) =>
  Object.fromEntries(
    Object.entries(value).filter(([, entry]) =>
      Boolean(menuSurfaceText(entry))
    )
  ) as Partial<T>
