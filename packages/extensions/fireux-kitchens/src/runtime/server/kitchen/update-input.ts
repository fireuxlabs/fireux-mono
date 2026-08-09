import { FieldValue } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { normalizeHexColor } from 'fireux-core/runtime/utils/brand-palette'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'

const record = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
const text = (value: unknown) => String(value ?? '').trim()
function fail(message: string): never {
  throw createError({ statusCode: 400, statusMessage: message })
}

const allowed = new Set([
  'slug',
  'identity.display_name',
  'identity.tagline',
  'identity.card_image_url',
  'identity.logo_image_url',
  'identity.wordmark_no_logo_image_url',
  'identity.wordmark_image_url',
  'identity.media_backdrop_color',
  'menus.currency_format',
  'menus.show_currency',
  'menus.available',
  'visibility.show',
  'visibility.active',
  'visibility.is_test',
  'orders.modes',
  'orders.default_lead_time_minutes',
  'orders.acceptance_required',
  'orders.operation_hours',
  'orders.printing',
  'tables.count',
  'fulfilment',
])
const groups = new Set(['identity', 'menus', 'visibility', 'orders', 'tables'])

function flatten(source: Record<string, unknown>) {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(source)) {
    if (!groups.has(key)) {
      out[key] = value
      continue
    }
    const nested = record(value)
    if (!nested) fail(`Kitchen ${key} update must be an object.`)
    for (const [child, childValue] of Object.entries(nested)) {
      out[`${key}.${child}`] = childValue
    }
  }
  const unsupported = Object.keys(out).find(key => !allowed.has(key))
  if (unsupported) fail(`Kitchen update contains unsupported field: ${unsupported}.`)
  return out
}

function boundedJson(value: unknown, label: string, max = 30_000) {
  if (!record(value)) fail(`${label} must be an object.`)
  const encoded = JSON.stringify(value)
  if (!encoded || encoded.length > max) fail(`${label} is too large.`)
  return value
}

function boundedString(value: unknown, label: string, max: number) {
  const result = text(value)
  if (result.length > max) fail(`${label} is too long.`)
  return result
}

function sparseString(value: unknown, label: string, max: number) {
  const result = boundedString(value, label, max)
  return result || FieldValue.delete()
}

export function parseKitchenUpdate(value: unknown) {
  const source = record(value)
  if (!source) fail('Kitchen update must be an object.')
  const patch = flatten(source)
  if (!Object.keys(patch).length) fail('Kitchen update has no fields.')
  const out: Record<string, unknown> = {}

  for (const [key, raw] of Object.entries(patch)) {
    if (key === 'slug') {
      const validation = validatePublicSlug(raw, {
        label: 'Kitchen slug',
        namespace: 'kitchens',
        reservedScope: 'root',
        maxLength: 80,
      })
      if (!validation.isValid) fail(validation.message || 'Kitchen slug is invalid.')
      out.slug = validation.slug
      continue
    }
    if (key.startsWith('identity.')) {
      if (key === 'identity.media_backdrop_color') {
        const color = normalizeHexColor(raw)
        if (color === null) fail('Media backdrop must be a 6-digit hex colour.')
        out[key] = color || FieldValue.delete()
      } else {
        out[key] = sparseString(raw, 'Kitchen identity value', 2048)
      }
      continue
    }
    if (key === 'menus.currency_format') {
      const format = boundedString(raw, 'Kitchen currency format', 40)
      out[key] = !format || format === 'dash' ? FieldValue.delete() : format
      continue
    }
    if (key === 'menus.show_currency' || key === 'menus.available') {
      if (typeof raw !== 'boolean') fail(`${key} must be boolean.`)
      out[key] = raw === true ? FieldValue.delete() : false
      continue
    }
    if (key.startsWith('visibility.')) {
      if (typeof raw !== 'boolean') fail(`${key} must be boolean.`)
      const defaultValue = key === 'visibility.active'
      out[key] = raw === defaultValue ? FieldValue.delete() : raw
      continue
    }
    if (key === 'orders.modes') {
      if (!Array.isArray(raw) || raw.length > 20) fail('Kitchen order modes are invalid.')
      const modes = (raw as unknown[]).map(item =>
        boundedString(item, 'Kitchen order mode', 50)
      )
      if (modes.some(item => !item) || new Set(modes).size !== modes.length) {
        fail('Kitchen order modes are invalid.')
      }
      out[key] = modes.length ? modes : FieldValue.delete()
      continue
    }
    if (key === 'orders.default_lead_time_minutes' || key === 'tables.count') {
      const number = Number(raw)
      if (!Number.isInteger(number) || number < 0 || number > 10_000) {
        fail(`${key} must be a bounded whole number.`)
      }
      out[key] = number
      continue
    }
    if (key === 'orders.acceptance_required') {
      if (typeof raw !== 'boolean') fail(`${key} must be boolean.`)
      out[key] = raw
      continue
    }
    if (key === 'orders.operation_hours' || key === 'orders.printing') {
      out[key] = raw === null
        ? FieldValue.delete()
        : boundedJson(raw, key, 15_000)
      continue
    }
    if (key === 'fulfilment') {
      out[key] = boundedJson(raw, 'Kitchen fulfilment')
    }
  }
  return out
}
