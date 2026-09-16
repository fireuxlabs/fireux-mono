import type { KitchenOrderWhatsAppNotificationPolicy } from '../models/ordering.model'

const text = (value: unknown) => String(value ?? '').trim()

export function normalizeKitchenOrderWhatsAppPhone(value: unknown) {
  const source = text(value)
  if (!source.startsWith('+')) return ''

  const digits = source.slice(1).replace(/[\s().-]/g, '')
  return /^[1-9]\d{7,14}$/.test(digits) ? `+${digits}` : ''
}

export function readKitchenOrderWhatsAppNotificationPolicy(
  value: unknown
): KitchenOrderWhatsAppNotificationPolicy | undefined {
  const row =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {}
  const recipientPhone = normalizeKitchenOrderWhatsAppPhone(row.recipient_phone)
  if (!recipientPhone) return undefined

  return {
    ...(row.enabled === true ? { enabled: true } : {}),
    recipient_phone: recipientPhone,
  }
}
