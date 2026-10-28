import { createError } from 'h3'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validate-public-slug'

const record = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
const text = (value: unknown) => String(value ?? '').trim()
function fail(message: string): never {
  throw createError({ statusCode: 400, statusMessage: message })
}

const allowed = new Set([
  'identity.slug',
  'identity.status',
  'identity.visibility',
  'tables.count',
  'services.title',
  'services.item_images',
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
    if (key === 'services.item_images') {
      if (typeof raw !== 'boolean') fail('Item image preference must be boolean.')
      out[key] = raw
      continue
    }
    if (key === 'services.title') {
      if (typeof raw !== 'string' || raw.trim().length > 120)
        fail('Service title must be text up to 120 characters.')
      out[key] = raw.trim() || 'Food & drinks'
      continue
    }
    if (key === 'tables.count') {
      if (
        typeof raw !== 'number' ||
        !Number.isSafeInteger(raw) ||
        raw < 0 ||
        raw > 500
      )
        fail('Number of tables must be a whole number from 0 to 500.')
      out[key] = raw
      continue
    }
    if (key === 'identity.slug') {
      const validation = validatePublicSlug(raw, {
        label: 'Kitchen slug',
        namespace: 'kitchens',
        reservedScope: 'root',
        maxLength: 80,
      })
      if (!validation.isValid)
        fail(validation.message || 'Kitchen slug is invalid.')
      out[key] = validation.slug
      continue
    }
    if (key === 'identity.status') {
      const status = boundedString(raw, 'Kitchen status', 20)
      if (!['active', 'inactive', 'archived'].includes(status)) {
        fail('Kitchen status must be active, inactive or archived.')
      }
      out[key] = status
      continue
    }
    if (key === 'identity.visibility') {
      if (typeof raw !== 'boolean') fail('Kitchen visibility must be boolean.')
      out[key] = raw
      continue
    }
  }
  return out
}
