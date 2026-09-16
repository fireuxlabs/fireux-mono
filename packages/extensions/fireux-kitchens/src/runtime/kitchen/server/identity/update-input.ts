import { createError } from 'h3'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'

const record = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
const text = (value: unknown) => String(value ?? '').trim()
function fail(message: string): never {
  throw createError({ statusCode: 400, statusMessage: message })
}

const allowed = new Set([
  'slug',
  'status',
  'visibility',
  'currency',
])

function flatten(source: Record<string, unknown>) {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(source)) {
    out[key] = value
  }
  const unsupported = Object.keys(out).find((key) => !allowed.has(key))
  if (unsupported)
    fail(`Kitchen update contains unsupported field: ${unsupported}.`)
  return out
}

function boundedString(value: unknown, label: string, max: number) {
  const result = text(value)
  if (result.length > max) fail(`${label} is too long.`)
  return result
}

export function parseKitchenUpdate(value: unknown) {
  const source = record(value)
  if (!source) fail('Kitchen update must be an object.')
  const patch = flatten(source)
  if (!Object.keys(patch).length) fail('Kitchen update has no fields.')
  const out: Record<string, unknown> = {}

  for (const [key, raw] of Object.entries(patch)) {
    if (key === 'currency') {
      const currency = typeof raw === 'string' ? raw.trim().toUpperCase() : ''
      if (!/^[A-Z]{3}$/.test(currency)) fail('Kitchen currency must be a three-letter currency code.')
      out.currency = currency
      continue
    }
    if (key === 'slug') {
      const validation = validatePublicSlug(raw, {
        label: 'Kitchen slug',
        namespace: 'kitchens',
        reservedScope: 'root',
        maxLength: 80,
      })
      if (!validation.isValid)
        fail(validation.message || 'Kitchen slug is invalid.')
      out.slug = validation.slug
      continue
    }
    if (key === 'status') {
      const status = boundedString(raw, 'Kitchen status', 20)
      if (!['active', 'inactive', 'archived'].includes(status)) {
        fail('Kitchen status must be active, inactive or archived.')
      }
      out.status = status
      continue
    }
    if (key === 'visibility') {
      if (typeof raw !== 'boolean') fail('Kitchen visibility must be boolean.')
      out.visibility = raw
      continue
    }
  }
  return out
}
