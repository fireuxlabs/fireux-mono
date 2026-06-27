import type {
  MenuDeliveryZone,
  MenuOrderDepositPolicy,
  MenuOrderFulfilmentPolicy,
  MenuOrderTypeConfig,
  MenuPaymentMethod,
} from '../models/menu/menu.model'
import type { KitchenOrderType } from '../models/order.model'

export const kitchenOrderTypes = [
  'dine_in',
  'collection',
  'delivery',
  'pre_order',
  'room_service',
] as const satisfies readonly KitchenOrderType[]

const paymentMethods = [
  'cash',
  'card_at_pickup',
  'card_to_driver',
  'online_card',
  'deposit',
] as const satisfies readonly MenuPaymentMethod[]

const depositTypes = [
  'fixed',
  'fixed_per_person',
  'percent',
] as const satisfies readonly MenuOrderDepositPolicy['type'][]

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

  const policy = compact({
    delivery_zones: deliveryZones,
    payment_methods: paymentMethods,
    deposit,
  }) as MenuOrderFulfilmentPolicy

  return Object.keys(policy).length ? policy : undefined
}

export const readMenuOrderTypeConfig = (
  value: unknown
): MenuOrderTypeConfig | null => {
  const row = record(value)
  const type = readKitchenOrderType(row.type)
  const notice = readNoticeHours(row.notice_hours)
  const message = text(row.message)
  const fulfilment = readMenuOrderFulfilmentPolicy(row.fulfilment)

  if (!type) return null

  return {
    type,
    ...(notice ? { notice_hours: notice } : {}),
    ...(message ? { message } : {}),
    ...(fulfilment ? { fulfilment } : {}),
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
