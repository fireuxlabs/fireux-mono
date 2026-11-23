import { createError } from 'h3'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestore-document-id'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validate-public-slug'
import {
  KitchenStatuses,
  KitchenVisibilities,
  type Kitchen,
} from '../../models/kitchen.model'

export type KitchenIdentityUpdate = Partial<
  Pick<Kitchen, 'name' | 'status' | 'visibility'> & {
    slug: string | null
    description: string | null
    imageUrl: string | null
    placeId: string | null
  }
>

export type KitchenUpdateInput = KitchenIdentityUpdate & {
  'identity.name'?: string
  'identity.slug'?: string
  'identity.status'?: 'active' | 'inactive' | 'archived'
  'identity.visibility'?: boolean
  'tables.count'?: number
  'services.title'?: string
  'services.item_images'?: boolean
}

const record = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
const text = (value: unknown) => String(value ?? '').trim()
function fail(message: string): never {
  throw createError({ statusCode: 400, statusMessage: message })
}

const identityFields = new Set([
  'name',
  'slug',
  'status',
  'visibility',
  'description',
  'imageUrl',
  'placeId',
  'identity.name',
  'identity.slug',
  'identity.status',
  'identity.visibility',
])

const capabilityFields = new Set([
  'tables.count',
  'services.title',
  'services.item_images',
])

function boundedString(value: unknown, label: string, max: number) {
  const result = text(value)
  if (result.length > max) fail(`${label} is too long.`)
  return result
}

function optionalText(value: unknown, label: string, max: number) {
  if (value === null) return null
  if (typeof value !== 'string') fail(`${label} must be text.`)
  return boundedString(value, label, max) || null
}

export function parseKitchenUpdate(
  value: unknown,
  runtimeReservedRouteKeys: readonly unknown[] = [],
  identityOnly = false
) {
  const source = record(value)
  if (!source) fail('Kitchen update must be an object.')
  const entries = Object.entries(source)
  if (!entries.length) fail('Kitchen update has no fields.')
  const out: Record<string, unknown> = {}

  for (const [key, raw] of entries) {
    if (
      !identityFields.has(key) &&
      (identityOnly || !capabilityFields.has(key))
    )
      fail(`Kitchen update contains unsupported field: ${key}.`)
    if (key === 'name' || key === 'identity.name') {
      if (typeof raw !== 'string' || !raw.trim() || raw.trim().length > 120)
        fail('Kitchen name is required and must be 120 characters or fewer.')
      out[key] = raw.trim()
      continue
    }
    if (key === 'services.item_images') {
      if (typeof raw !== 'boolean')
        fail('Item image preference must be boolean.')
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
    if (key === 'slug' || key === 'identity.slug') {
      if (key === 'slug' && raw === null) {
        out[key] = null
        continue
      }
      if (typeof raw !== 'string') fail('Kitchen slug must be text.')
      const validation = validatePublicSlug(raw, {
        label: 'Kitchen slug',
        namespace: 'kitchens',
        reservedScope: 'root',
        runtimeReservedRouteKeys,
        maxLength: 80,
      })
      if (!validation.isValid)
        fail(validation.message || 'Kitchen slug is invalid.')
      out[key] = validation.slug
      continue
    }
    if (key === 'status') {
      if (!KitchenStatuses.some((status) => status === raw))
        fail('Kitchen status must be draft, active or archived.')
      out[key] = raw
      continue
    }
    if (key === 'visibility') {
      if (!KitchenVisibilities.some((visibility) => visibility === raw))
        fail('Kitchen visibility must be public, unlisted or private.')
      out[key] = raw
      continue
    }
    if (key === 'description') {
      out[key] = optionalText(raw, 'Kitchen description', 2000)
      continue
    }
    if (key === 'imageUrl') {
      const url = optionalText(raw, 'Kitchen image URL', 2048)
      if (url) {
        const parsed = URL.canParse(url) ? new URL(url) : null
        if (parsed?.protocol !== 'https:' || parsed.username || parsed.password)
          fail('Kitchen image URL must be an HTTPS URL without credentials.')
      }
      out[key] = url
      continue
    }
    if (key === 'placeId') {
      const id = optionalText(raw, 'Place id', 250)
      if (id !== null && !isFirestoreDocumentId(id))
        fail('Place id is invalid.')
      out[key] = id
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
  if ('slug' in out && 'identity.slug' in out) fail('Specify one Kitchen slug.')
  return out
}
