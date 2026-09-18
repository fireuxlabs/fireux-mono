import { createError } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  KitchenOrderTypes,
  type KitchenOrderType,
} from '../../models/order-lifecycle.model'
import type { KitchenServiceInteractionChanges } from '../../models/service.model'

const fail = (message: string): never => {
  throw createError({ statusCode: 400, statusMessage: message })
}
const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return fail('Invalid ordering settings.')
  return value as Record<string, unknown>
}
const allowed = (value: Record<string, unknown>, keys: string[]) => {
  if (Object.keys(value).some((key) => !keys.includes(key)))
    fail('Unsupported ordering setting.')
}
export function readInteractionChanges(input: unknown) {
  const body = object(input)
  allowed(body, ['kitchenId', 'serviceId', 'type', 'changes'])
  const kitchenId = requireFirestoreDocumentId(body.kitchenId, 'Kitchen id')
  const serviceId = requireFirestoreDocumentId(body.serviceId, 'Service id')
  const type = body.type as KitchenOrderType | 'browse'
  if (type !== 'browse' && !KitchenOrderTypes.includes(type))
    fail('Unknown ordering service.')
  const changes = object(body.changes)
  allowed(changes, [
    'enabled',
    'notice_hours',
    'message',
    'asap_enabled',
    'slot_interval_minutes',
    'schedule_horizon_days',
    'fulfilment',
    'customer',
    'availability',
    'notifications',
  ])
  if (type === 'browse') allowed(changes, ['enabled'])
  for (const key of ['enabled', 'asap_enabled'])
    if (key in changes && typeof changes[key] !== 'boolean')
      fail('Invalid service switch.')
  for (const [key, min, max] of [
    ['notice_hours', 0, 168],
    ['schedule_horizon_days', 1, 30],
    ['slot_interval_minutes', 15, 60],
  ] as const) {
    if (
      key in changes &&
      (typeof changes[key] !== 'number' ||
        !Number.isFinite(changes[key]) ||
        Number(changes[key]) < min ||
        Number(changes[key]) > max)
    )
      fail(`Invalid ${key}.`)
  }
  if (
    'slot_interval_minutes' in changes &&
    ![15, 30, 45, 60].includes(Number(changes.slot_interval_minutes))
  )
    fail('Invalid time interval.')
  if (
    'schedule_horizon_days' in changes &&
    !Number.isInteger(changes.schedule_horizon_days)
  )
    fail('Invalid scheduling horizon.')
  if (
    'message' in changes &&
    (typeof changes.message !== 'string' || changes.message.length > 2000)
  )
    fail('Invalid customer message.')
  if ('fulfilment' in changes) {
    const fulfilment = object(changes.fulfilment)
    allowed(fulfilment, ['handoff_instructions', 'deposit'])
    if (
      'handoff_instructions' in fulfilment &&
      (typeof fulfilment.handoff_instructions !== 'string' ||
        fulfilment.handoff_instructions.length > 2000)
    )
      fail('Invalid handoff instructions.')
    if ('deposit' in fulfilment && fulfilment.deposit !== null) {
      const deposit = object(fulfilment.deposit)
      allowed(deposit, ['type', 'amount', 'currency_code', 'label'])
      if (
        'currency_code' in deposit &&
        (typeof deposit.currency_code !== 'string' ||
          !/^[A-Z]{3}$/.test(deposit.currency_code))
      )
        fail('Invalid deposit currency.')
      if (
        'label' in deposit &&
        (typeof deposit.label !== 'string' || deposit.label.length > 240)
      )
        fail('Invalid deposit label.')
      if (
        !['fixed', 'fixed_per_person', 'percent'].includes(
          String(deposit.type)
        ) ||
        typeof deposit.amount !== 'number' ||
        !Number.isFinite(deposit.amount) ||
        deposit.amount <= 0 ||
        (deposit.type === 'percent' && deposit.amount > 100)
      )
        fail('Invalid deposit.')
    }
  }
  if ('customer' in changes) {
    const customer = object(changes.customer)
    allowed(customer, ['required_fields'])
    if (
      !Array.isArray(customer.required_fields) ||
      customer.required_fields.some(
        (value) => !['name', 'phone', 'email'].includes(String(value))
      )
    )
      fail('Invalid contact requirements.')
  }
  if ('availability' in changes) {
    const availability = object(changes.availability)
    allowed(availability, ['paused', 'message'])
    if ('paused' in availability && typeof availability.paused !== 'boolean')
      fail('Invalid pause setting.')
    if (
      'message' in availability &&
      (typeof availability.message !== 'string' ||
        availability.message.length > 2000)
    )
      fail('Invalid pause message.')
  }
  if ('notifications' in changes) {
    const notifications = object(changes.notifications)
    allowed(notifications, ['whatsapp'])
    if (notifications.whatsapp) {
      const whatsapp = object(notifications.whatsapp)
      allowed(whatsapp, ['enabled', 'recipient_phone'])
      if (
        typeof whatsapp.enabled !== 'boolean' ||
        (whatsapp.enabled &&
          !/^\+[1-9]\d{6,14}$/.test(String(whatsapp.recipient_phone)))
      )
        fail('Invalid WhatsApp recipient.')
    }
  }
  return {
    kitchenId,
    serviceId,
    type,
    changes: changes as KitchenServiceInteractionChanges,
  }
}
