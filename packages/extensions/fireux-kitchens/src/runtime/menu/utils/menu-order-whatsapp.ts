// Concurrent edit — 2026-07-19 21:10 CEST — Pre-order WhatsApp pass: normalize the configured Kitchen alert recipient once.
import type {
  MenuOrderWhatsAppNotificationPolicy,
} from '../models/kitchen-menu.model.ts'

const text = (value: unknown) => String(value ?? '').trim()

export function normalizeMenuOrderWhatsAppPhone(value: unknown) {
  const source = text(value)
  if (!source.startsWith('+')) return ''

  const digits = source.slice(1).replace(/[\s().-]/g, '')
  return /^[1-9]\d{7,14}$/.test(digits) ? `+${digits}` : ''
}

export function readMenuOrderWhatsAppNotificationPolicy(
  value: unknown
): MenuOrderWhatsAppNotificationPolicy | undefined {
  const row = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
  const recipientPhone = normalizeMenuOrderWhatsAppPhone(row.recipient_phone)
  if (!recipientPhone) return undefined

  return {
    ...(row.enabled === true ? { enabled: true } : {}),
    recipient_phone: recipientPhone,
  }
}
