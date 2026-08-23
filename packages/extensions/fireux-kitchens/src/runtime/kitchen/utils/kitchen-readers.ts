// Concurrent edit — 2026-07-19 16:58 CEST — Delivery pass: normalize Kitchen-owned zones and per-surface payment capability.
// Concurrent edit — 2026-07-20 22:37 CEST — Place-root authority pass: resolve explicit Kitchen overrides through the concrete Place runtime module.
import type { CurrencyDisplayFormat } from '../../models/shared/currency-display.model.ts'
import type { PageStyle } from 'fireux-core/runtime/models/utils/style.model'
import type { WorkspacePalette } from 'fireux-core/types/theme'
import { readWorkspacePalette } from 'fireux-core/runtime/utils/brand-palette'
import {
  readSproochliAttachmentConfig,
  type SproochliAttachmentConfig,
} from 'fireux-sproochli/runtime/sproochli'
import {
  readMediaBackdropColor,
  readPlaceBusinessHours,
} from 'fireux-places/runtime/place/utils/place-spine'
import type { KitchenOrderType } from '../utils/order.ts'
import { readWeekdayTimeWindowsConfig } from '../../utils/weekday-time'
import type { KitchenFulfilment } from '../models/fulfilment.model.ts'
export {
  KitchenPaymentMethodDefaultOrderTypes,
  readKitchenFulfilmentConfig,
} from './kitchen-fulfilment-reader.ts'

type KitchenRecord = Record<string, unknown> | null | undefined

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const optionalRecord = (
  value: unknown
): Record<string, unknown> | undefined => {
  const item = record(value)
  return Object.keys(item).length ? item : undefined
}
const bool = (value: unknown, fallback: boolean) =>
  typeof value === 'boolean' ? value : fallback
const stringArray = (value: unknown) =>
  Array.isArray(value) ? value.map(text).filter(Boolean) : []
const hasKeys = (value: Record<string, unknown>) =>
  Boolean(Object.keys(value).length)

export const kitchenPaymentMethodsForOrderType = (
  fulfilment: KitchenFulfilment | null | undefined,
  orderType: KitchenOrderType
) =>
  (fulfilment?.payment_methods || [])
    .filter((policy) => policy.order_types.includes(orderType))
    .map((policy) => policy.method)
export const composeKitchenScopedSurface = (
  rootKitchen: KitchenRecord,
  scopedKitchen: KitchenRecord
) => {
  const rootRecord = record(rootKitchen)
  const scopedRecord = record(scopedKitchen)

  if (!hasKeys(rootRecord)) return null
  if (!hasKeys(scopedRecord)) return rootRecord

  const composed: Record<string, unknown> = {
    ...rootRecord,
    ...(Array.isArray(scopedRecord.operator_ids)
      ? { operator_ids: scopedRecord.operator_ids }
      : {}),
    ...(Array.isArray(scopedRecord.team_ids)
      ? { team_ids: scopedRecord.team_ids }
      : {}),
    ...(Array.isArray(scopedRecord.join_requests)
      ? { join_requests: scopedRecord.join_requests }
      : {}),
  }
  if (Object.hasOwn(rootRecord, 'sproochli')) {
    composed.sproochli = readSproochliAttachmentConfig(rootRecord.sproochli)
  } else {
    delete composed.sproochli
  }

  return composed
}

export const readKitchenVisibility = (value: KitchenRecord) => {
  const source = record(value)
  return source.visibility === true
}

export const readKitchenMenusConfig = (value: KitchenRecord) => {
  const source = record(value)
  const menus = record(source.menus)
  return {
    context: text(menus.context),
    currencyFormat: (text(menus.currency_format) ||
      'dash') as CurrencyDisplayFormat,
    showCurrency: bool(menus.show_currency, true),
    available: bool(menus.available, true),
    primaryMenuId: text(menus.primary_menu_id),
    specialsEnabled: menus.specials_enabled === true,
    specialsMenuId: text(menus.specials_menu_id),
  }
}

export const readKitchenSproochliConfig = (
  value: KitchenRecord
): SproochliAttachmentConfig =>
  readSproochliAttachmentConfig(record(record(value).integrations).sproochli)

export const readKitchenThemePalette = (
  value: KitchenRecord
): WorkspacePalette | null => {
  const theme = record(record(value).theme)
  return readWorkspacePalette(theme.palette)
}

export const readKitchenMenuPageStyle = (
  value: KitchenRecord
): Partial<PageStyle> => {
  const palette = readKitchenThemePalette(value)
  if (!palette) return {}
  return {
    background_color_light: palette.canvas,
    background_color_dark: palette.canvas,
    font_color_light: palette.text,
    font_color_dark: palette.text,
    title_color_light: palette.text,
    title_color_dark: palette.text,
    primary_color: palette.accent,
    secondary_color: palette.accent,
  }
}

export const readKitchenTableCount = (value: KitchenRecord) => {
  const source = record(value)
  const tables = record(source.tables)
  const count = Number(tables.count)

  return Number.isSafeInteger(count) && count > 0 ? Math.min(count, 500) : 0
}

export const readKitchenOperationHours = (value: KitchenRecord) => {
  const source = record(value)
  const orders = record(source.orders)

  return readWeekdayTimeWindowsConfig(orders.operation_hours)
}

export const hasKitchenOperationHours = (value: KitchenRecord) => {
  const source = record(value)
  const orders = record(source.orders)

  return hasKeys(record(orders.operation_hours))
}

export const resolveKitchenOperationHours = (
  kitchen: KitchenRecord,
  place: KitchenRecord
) => {
  const kitchenHours = readKitchenOperationHours(kitchen)
  const placeHours = readPlaceBusinessHours(place)

  if (
    hasKitchenOperationHours(kitchen) &&
    kitchenHours.source === 'custom' &&
    kitchenHours.windows.length
  ) {
    return kitchenHours
  }

  if (placeHours) {
    return {
      source: 'place' as const,
      timezone: placeHours.timezone,
      windows: placeHours.windows,
    }
  }

  return {
    source: 'place' as const,
    timezone: text(record(place).timezone) || kitchenHours.timezone,
    windows: [],
  }
}
