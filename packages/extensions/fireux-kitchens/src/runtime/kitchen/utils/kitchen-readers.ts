// Concurrent edit — 2026-07-19 16:58 CEST — Delivery pass: normalize Kitchen-owned zones and per-surface payment capability.
// Concurrent edit — 2026-07-20 22:37 CEST — Place-root authority pass: resolve explicit Kitchen overrides through the concrete Place runtime module.
import { intersectWeekdayHours } from '../../utils/weekday-time-constraints'
import type { WorkspacePalette } from 'fireux-core/types/theme'
import { readWorkspacePalette } from 'fireux-core/runtime/utils/brand-palette'
import { readPlaceBusinessHours } from 'fireux-places/runtime/place/utils/place-spine'
import type { KitchenOrderType } from '../models/offering-interaction-types.model'
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
const hasKeys = (value: Record<string, unknown>) =>
  Boolean(Object.keys(value).length)

export const kitchenPaymentMethodsForOrderType = (
  fulfilment: KitchenFulfilment | null | undefined,
  orderType: KitchenOrderType
) =>
  (fulfilment?.payment_methods || [])
    .filter((policy) => policy.order_types.includes(orderType))
    .map((policy) => policy.method)
export const readKitchenVisibility = (value: KitchenRecord) => {
  const source = record(value)
  return record(source.identity).visibility === true
}

export const readKitchenThemePalette = (
  value: KitchenRecord
): WorkspacePalette | null => {
  const theme = record(record(value).theme)
  return readWorkspacePalette(theme.palette)
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
    return placeHours
      ? intersectWeekdayHours(kitchenHours, { ...placeHours, source: 'place' })
      : { ...kitchenHours, windows: [] }
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
