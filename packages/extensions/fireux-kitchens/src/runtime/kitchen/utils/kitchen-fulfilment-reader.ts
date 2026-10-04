import type {
  KitchenFulfilment,
  KitchenFulfilmentPaymentPolicy,
  KitchenPaymentRequirement,
  KitchenDeliveryZone,
  KitchenFulfilmentPaymentMethod,
} from '../models/fulfilment.model.ts'
import type { KitchenOrderType } from './order.ts'

type KitchenRecord = Record<string, unknown> | null | undefined
const text = (value: unknown) => String(value ?? '').trim()
const list = (value: unknown) => (Array.isArray(value) ? value : [])
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const numberValue = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : undefined
}
const compact = (value: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(value).filter(([, entry]) =>
      Array.isArray(entry)
        ? entry.length > 0
        : entry !== undefined && entry !== ''
    )
  )

const orderTypes = [
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
] as const satisfies readonly KitchenFulfilmentPaymentMethod[]
const paymentRequirements = [
  'verified_room',
] as const satisfies readonly KitchenPaymentRequirement[]

export const KitchenPaymentMethodDefaultOrderTypes = {
  cash: [
    'collection',
    'delivery',
    'dine_in',
    'eat_in',
    'takeaway',
    'pre_order',
  ],
  card_at_pickup: ['collection', 'eat_in', 'takeaway', 'pre_order'],
  card_to_driver: ['delivery'],
  room_charge: ['room_service'],
  online_card: [...orderTypes],
} as const satisfies Record<
  KitchenFulfilmentPaymentMethod,
  readonly KitchenOrderType[]
>

const readZone = (value: unknown): KitchenDeliveryZone | null => {
  const row = record(value)
  const id = text(row.id)
  const label = text(row.label)
  if (!id || !label) return null
  const polygon = list(row.polygon)
    .map((value) => {
      const point = record(value)
      const lat = Number(point.lat)
      const lng = Number(point.lng)
      return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null
    })
    .filter((point): point is { lat: number; lng: number } => Boolean(point))
  return compact({
    id,
    label,
    min_order_chf: numberValue(row.min_order_chf),
    fee_chf: numberValue(row.fee_chf),
    radius_m: numberValue(row.radius_m),
    postal_codes: list(row.postal_codes).map(text).filter(Boolean),
    place_ids: list(row.place_ids).map(text).filter(Boolean),
    polygon,
    color: text(row.color),
  }) as KitchenDeliveryZone
}

const readPaymentPolicy = (
  value: unknown
): KitchenFulfilmentPaymentPolicy | null => {
  const row = record(value)
  const flatMethod = text(value) as KitchenFulfilmentPaymentMethod
  const nestedMethod = text(row.method) as KitchenFulfilmentPaymentMethod
  const method = paymentMethods.includes(flatMethod)
    ? flatMethod
    : paymentMethods.includes(nestedMethod)
      ? nestedMethod
      : null
  if (!method) return null
  const configuredTypes = list(row.order_types)
    .map(text)
    .filter((type): type is KitchenOrderType =>
      orderTypes.includes(type as KitchenOrderType)
    )
  const requirements = list(row.requirements)
    .map(text)
    .filter((value): value is KitchenPaymentRequirement =>
      paymentRequirements.includes(value as KitchenPaymentRequirement)
    )
  return {
    method,
    order_types: configuredTypes.length
      ? [...new Set(configuredTypes)]
      : [...KitchenPaymentMethodDefaultOrderTypes[method]],
    ...(requirements.length
      ? { requirements: [...new Set(requirements)] }
      : {}),
  }
}

export function readKitchenFulfilmentConfig(
  value: KitchenRecord
): KitchenFulfilment {
  const source = record(value)
  const fulfilment =
    Object.hasOwn(source, 'delivery_zones') ||
    Object.hasOwn(source, 'payment_methods')
      ? source
      : record(source.fulfilment)
  const policies = list(fulfilment.payment_methods)
    .map(readPaymentPolicy)
    .filter((policy): policy is KitchenFulfilmentPaymentPolicy =>
      Boolean(policy)
    )
    .filter(
      (policy, index, all) =>
        all.findIndex((candidate) => candidate.method === policy.method) ===
        index
    )
  return {
    delivery_zones: list(fulfilment.delivery_zones)
      .map(readZone)
      .filter((zone): zone is KitchenDeliveryZone => Boolean(zone)),
    payment_methods: policies,
  }
}
