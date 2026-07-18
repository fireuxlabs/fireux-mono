import type {
  MenuDeliveryZone,
  MenuOrderContactField,
  MenuOrderDepositPolicy,
  MenuOrderFulfilmentPolicy,
  MenuOrderTypeConfig,
  MenuPaymentMethod,
  MenuServiceHoursConfig,
} from '../models/kitchen/menu/menu.model'
import { MenuOrderContactFields } from '../models/kitchen/menu/menu.model'
import type { KitchenOrderType } from '../models/kitchen/order.model'
import { readWeekdayTimeWindowsConfig } from './weekday-time'

export const kitchenOrderTypes = [
  'dine_in',
  'eat_in',
  'takeaway',
  'collection',
  'delivery',
  'pre_order',
  'room_service',
] as const satisfies readonly KitchenOrderType[]

const paymentMethods = [
  'cash',
  'card_at_pickup',
  'card_to_driver',
  'room_charge',
  'online_card',
] as const satisfies readonly MenuPaymentMethod[]

const depositTypes = [
  'fixed',
  'fixed_per_person',
  'percent',
] as const satisfies readonly MenuOrderDepositPolicy['type'][]

const collectionSlotIntervals = [15, 30, 45, 60] as const

const text = (value: unknown) => String(value ?? '').trim()
const list = (value: unknown) => Array.isArray(value) ? value : []
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const numberValue = (value: unknown) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : undefined
}
const positiveNumber = (value: unknown) => {
  const number = numberValue(value)

  return number && number > 0 ? number : undefined
}
const nonNegativeNumber = (value: unknown) => {
  const number = numberValue(value)

  return number !== undefined && number >= 0 ? number : undefined
}
const compact = <T extends Record<string, unknown>>(value: T) =>
  Object.fromEntries(
    Object.entries(value).filter(([, entry]) =>
      Array.isArray(entry) ? entry.length > 0 : entry !== undefined && entry !== ''
    )
  ) as Partial<T>

export const readKitchenOrderType = (value: unknown): KitchenOrderType | null => {
  const type = text(value) as KitchenOrderType

  return kitchenOrderTypes.includes(type) ? type : null
}

export const readNoticeHours = (value: unknown) => positiveNumber(value)

const readPaymentMethods = (value: unknown): MenuPaymentMethod[] =>
  list(value)
    .map((method) => text(method) as MenuPaymentMethod)
    .filter((method): method is MenuPaymentMethod =>
      paymentMethods.includes(method)
    )
    .filter((method, index, source) => source.indexOf(method) === index)

const readContactFields = (value: unknown): MenuOrderContactField[] =>
  list(value)
    .map((field) => text(field) as MenuOrderContactField)
    .filter((field): field is MenuOrderContactField =>
      MenuOrderContactFields.includes(field)
    )
    .filter((field, index, source) => source.indexOf(field) === index)

const readDeliveryZone = (value: unknown): MenuDeliveryZone | null => {
  const row = record(value)
  const id = text(row.id)
  const label = text(row.label)
  if (!id || !label) return null

  const polygon = list(row.polygon)
    .map((point) => {
      const source = record(point)
      const lat = numberValue(source.lat)
      const lng = numberValue(source.lng)

      return lat !== undefined && lng !== undefined ? { lat, lng } : null
    })
    .filter((point): point is { lat: number, lng: number } => Boolean(point))

  return compact({
    id,
    label,
    min_order_chf: nonNegativeNumber(row.min_order_chf),
    fee_chf: nonNegativeNumber(row.fee_chf),
    radius_m: nonNegativeNumber(row.radius_m),
    postal_codes: list(row.postal_codes)
      .map(text)
      .filter(Boolean),
    place_ids: list(row.place_ids)
      .map(text)
      .filter(Boolean),
    polygon,
    color: text(row.color),
  }) as MenuDeliveryZone
}

const readDeposit = (value: unknown): MenuOrderDepositPolicy | undefined => {
  const row = record(value)
  const type = text(row.type) as MenuOrderDepositPolicy['type']
  const amount = positiveNumber(row.amount)
  if (!depositTypes.includes(type) || !amount) return undefined

  return compact({
    type,
    amount,
    currency_code: text(row.currency_code),
    label: text(row.label),
  }) as MenuOrderDepositPolicy
}

export const readMenuOrderFulfilmentPolicy = (
  value: unknown
): MenuOrderFulfilmentPolicy | undefined => {
  const row = record(value)
  const deliveryZones = list(row.delivery_zones)
    .map(readDeliveryZone)
    .filter((zone): zone is MenuDeliveryZone => Boolean(zone))
  const paymentMethods = readPaymentMethods(row.payment_methods)
  const deposit = readDeposit(row.deposit)
  const handoffInstructions = text(row.handoff_instructions)

  const policy = compact({
    delivery_zones: deliveryZones,
    payment_methods: paymentMethods,
    deposit,
    handoff_instructions: handoffInstructions,
  }) as MenuOrderFulfilmentPolicy

  return Object.keys(policy).length ? policy : undefined
}

export const readMenuServiceHoursConfig = (
  value: unknown
): MenuServiceHoursConfig | undefined => {
  const row = record(value)
  const inheritKitchen = row.inherit_kitchen_operation_hours === true
  const inheritMenu = row.inherit_menu_service_hours === true
  const operationHours = readWeekdayTimeWindowsConfig(row.operation_hours)

  if (!inheritKitchen && !inheritMenu && !operationHours.windows.length) {
    return undefined
  }

  return compact({
    inherit_kitchen_operation_hours: inheritKitchen || undefined,
    inherit_menu_service_hours: inheritMenu || undefined,
    operation_hours: operationHours.windows.length ? operationHours : undefined,
  }) as MenuServiceHoursConfig
}

export const readMenuOrderTypeConfig = (
  value: unknown
): MenuOrderTypeConfig | null => {
  const row = record(value)
  const type = readKitchenOrderType(row.type)
  const notice = readNoticeHours(row.notice_hours)
  const message = text(row.message)
  const serviceHours = readMenuServiceHoursConfig(row.service_hours)
  const asapEnabled = typeof row.asap_enabled === 'boolean'
    ? row.asap_enabled
    : undefined
  const slotInterval = Math.round(positiveNumber(row.slot_interval_minutes) || 0)
  const scheduleHorizon = Math.round(positiveNumber(row.schedule_horizon_days) || 0)
  const fulfilment = readMenuOrderFulfilmentPolicy(row.fulfilment)
  const customerRow = record(row.customer)
  const requiredFields = readContactFields(customerRow.required_fields)
  const availabilityRow = record(row.availability)
  const availabilityMessage = text(availabilityRow.message)
  const availability = availabilityRow.paused === true || availabilityMessage
    ? {
        ...(availabilityRow.paused === true ? { paused: true } : {}),
        ...(availabilityMessage ? { message: availabilityMessage } : {}),
      }
    : undefined

  if (!type) return null

  return {
    type,
    ...(notice ? { notice_hours: notice } : {}),
    ...(message ? { message } : {}),
    ...(serviceHours ? { service_hours: serviceHours } : {}),
    ...(asapEnabled !== undefined ? { asap_enabled: asapEnabled } : {}),
    ...(collectionSlotIntervals.includes(
      slotInterval as typeof collectionSlotIntervals[number]
    )
      ? { slot_interval_minutes: slotInterval }
      : {}),
    ...(scheduleHorizon >= 1 && scheduleHorizon <= 30
      ? { schedule_horizon_days: scheduleHorizon }
      : {}),
    ...(fulfilment ? { fulfilment } : {}),
    ...(requiredFields.length
      ? { customer: { required_fields: requiredFields } }
      : {}),
    ...(availability ? { availability } : {}),
  }
}

export const menuAcceptsOrderType = (
  menu: unknown,
  type: KitchenOrderType
) => {
  const ordering = record(record(menu).ordering)
  if (ordering.enabled !== true) return false

  return list(ordering.order_types)
    .map(readMenuOrderTypeConfig)
    .some((config) => config?.type === type)
}
