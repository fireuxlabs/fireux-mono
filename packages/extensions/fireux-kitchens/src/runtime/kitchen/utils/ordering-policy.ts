import type {
  KitchenOrderContactField,
  KitchenOrderDepositPolicy,
  KitchenOrderFulfilmentPolicy,
  KitchenOrderTypeConfig,
  KitchenServiceHoursConfig,
} from '../models/ordering.model'
import { KitchenOrderContactFields } from '../models/ordering.model'
import {
  KitchenOrderTypes,
  type KitchenOrderType,
} from '../models/order-lifecycle.model'
import { readWeekdayTimeWindowsConfig } from '../../utils/weekday-time'
import { readKitchenOrderWhatsAppNotificationPolicy } from './ordering-whatsapp'

const depositTypes = [
  'fixed',
  'fixed_per_person',
  'percent',
] as const satisfies readonly KitchenOrderDepositPolicy['type'][]

const collectionSlotIntervals = [15, 30, 45, 60] as const

const text = (value: unknown) => String(value ?? '').trim()
const list = (value: unknown) => (Array.isArray(value) ? value : [])
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
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
      Array.isArray(entry)
        ? entry.length > 0
        : entry !== undefined && entry !== ''
    )
  ) as Partial<T>

export const readKitchenOrderType = (
  value: unknown
): KitchenOrderType | null => {
  const type = text(value) as KitchenOrderType

  return KitchenOrderTypes.includes(type) ? type : null
}

export const readNoticeHours = (value: unknown) => nonNegativeNumber(value)

const readContactFields = (value: unknown): KitchenOrderContactField[] =>
  list(value)
    .map((field) => text(field) as KitchenOrderContactField)
    .filter((field): field is KitchenOrderContactField =>
      KitchenOrderContactFields.includes(field)
    )
    .filter((field, index, source) => source.indexOf(field) === index)

const readDeposit = (value: unknown): KitchenOrderDepositPolicy | undefined => {
  const row = record(value)
  const type = text(row.type) as KitchenOrderDepositPolicy['type']
  const amount = positiveNumber(row.amount)
  if (!depositTypes.includes(type) || !amount) return undefined

  return compact({
    type,
    amount,
    currency_code: text(row.currency_code),
    label: text(row.label),
  }) as KitchenOrderDepositPolicy
}

export const readKitchenOrderFulfilmentPolicy = (
  value: unknown
): KitchenOrderFulfilmentPolicy | undefined => {
  const row = record(value)
  const deposit = readDeposit(row.deposit)
  const handoffInstructions = text(row.handoff_instructions)

  const policy = compact({
    deposit,
    handoff_instructions: handoffInstructions,
  }) as KitchenOrderFulfilmentPolicy

  return Object.keys(policy).length ? policy : undefined
}

export const readKitchenServiceHoursConfig = (
  value: unknown
): KitchenServiceHoursConfig | undefined => {
  const row = record(value)
  const inheritKitchen = row.inherit_kitchen_operation_hours === true
  const operationHours = readWeekdayTimeWindowsConfig(row.operation_hours)

  if (!inheritKitchen && !operationHours.windows.length) {
    return undefined
  }

  return compact({
    inherit_kitchen_operation_hours: inheritKitchen,
    operation_hours: operationHours.windows.length ? operationHours : undefined,
  }) as KitchenServiceHoursConfig
}

export const readKitchenOrderTypeConfig = (
  value: unknown
): KitchenOrderTypeConfig | null => {
  const row = record(value)
  const type = readKitchenOrderType(row.type)
  const notice = readNoticeHours(row.notice_hours)
  const message = text(row.message)
  const serviceHours = readKitchenServiceHoursConfig(row.service_hours)
  const asapEnabled =
    typeof row.asap_enabled === 'boolean' ? row.asap_enabled : undefined
  const slotInterval = Math.round(
    positiveNumber(row.slot_interval_minutes) || 0
  )
  const scheduleHorizon = Math.round(
    positiveNumber(row.schedule_horizon_days) || 0
  )
  const fulfilment = readKitchenOrderFulfilmentPolicy(row.fulfilment)
  const customerRow = record(row.customer)
  const requiredFields = readContactFields(customerRow.required_fields)
  const availabilityRow = record(row.availability)
  const availabilityMessage = text(availabilityRow.message)
  const availability =
    availabilityRow.paused === true || availabilityMessage
      ? {
          ...(availabilityRow.paused === true ? { paused: true } : {}),
          ...(availabilityMessage ? { message: availabilityMessage } : {}),
        }
      : undefined
  const notificationRow = record(row.notifications)
  const whatsappNotification =
    type === 'pre_order'
      ? readKitchenOrderWhatsAppNotificationPolicy(notificationRow.whatsapp)
      : undefined

  if (!type) return null

  return {
    type,
    ...(notice !== undefined ? { notice_hours: notice } : {}),
    ...(message ? { message } : {}),
    ...(serviceHours ? { service_hours: serviceHours } : {}),
    ...(asapEnabled !== undefined ? { asap_enabled: asapEnabled } : {}),
    ...(collectionSlotIntervals.includes(
      slotInterval as (typeof collectionSlotIntervals)[number]
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
    ...(whatsappNotification
      ? { notifications: { whatsapp: whatsappNotification } }
      : {}),
  }
}
