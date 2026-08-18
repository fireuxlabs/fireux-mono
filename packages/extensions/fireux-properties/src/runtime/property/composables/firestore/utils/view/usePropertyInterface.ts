// Concurrent edit — 2026-07-20 23:00 CEST — Both-Entity Authority — Property: exact-validate published roots and keep collection surfaces free of private manuals.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: name the allowlisted App access input directly.
import {
  PropertyManualModel,
  PropertyStorage,
  type AppProperty,
  type Property,
  type PropertyManual,
} from '../../../../models/property.model.ts'
import { readFireuxEntityManagement } from 'fireux-core/runtime/utils/entity-management'

const safeString = (value: unknown) => String(value ?? '').trim()
const defaultCurrency = 'GBP'
const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
const hasOnlyKeys = (value: Record<string, unknown>, keys: readonly string[]) => {
  const allowed = new Set(keys)
  return Object.keys(value).every((key) => allowed.has(key))
}
const validStamp = (
  value: unknown,
  keys: readonly string[]
): value is Record<string, unknown> => {
  const stamp = asRecord(value)
  if (!stamp || !hasOnlyKeys(stamp, keys)) return false
  if (!asRecord(stamp.at)) return false
  return ['by', 'app_id'].every(
    (key) => stamp[key] === undefined || typeof stamp[key] === 'string'
  )
}
const safeStringArray = (value: unknown) =>
  Array.isArray(value)
    ? [...new Set(value.map((entry) => safeString(entry)).filter(Boolean))]
    : []

export type PropertySurface = Property &
  Pick<AppProperty, 'operator_ids' | 'team_ids' | 'join_requests'>

export function canonicalPropertyRoot(source?: Property | null): Property | null {
  const root = asRecord(source)
  if (!root || !hasOnlyKeys(root, [
    'id',
    'slug',
    'portfolio_id',
    'place_id',
    'management',
    'identity',
    'status',
    'publication_state',
    'created',
    'updated',
  ])) return null
  if (
    typeof source?.id !== 'string' ||
    typeof source.slug !== 'string' ||
    typeof source.portfolio_id !== 'string' ||
    typeof source.place_id !== 'string' ||
    typeof source.status !== 'string' ||
    typeof source.publication_state !== 'string'
  ) return null
  const id = source.id.trim()
  const slug = source.slug.trim()
  const placeId = source.place_id.trim()
  const management = readFireuxEntityManagement(source.management)
  const identity = asRecord(source.identity)
  const propertyType = identity?.property_type
  const status = source.status
  const publicationState = source.publication_state

  if (!id || !slug || !placeId || !identity || !management) return null
  if (!hasOnlyKeys(identity, [
    'name',
    'image_url',
    'property_type',
    'unit_count',
    'estimated_value',
    'estimated_value_currency',
  ])) return null
  if (
    typeof identity.name !== 'string' ||
    !identity.name.trim() ||
    typeof identity.image_url !== 'string' ||
    typeof propertyType !== 'string' ||
    typeof identity.unit_count !== 'number' ||
    typeof identity.estimated_value !== 'number' ||
    typeof identity.estimated_value_currency !== 'string'
  ) return null
  if (!validStamp(source.created, ['at', 'by', 'app_id'])) return null
  if (!validStamp(source.updated, ['at', 'by'])) return null
  if (!['residential', 'commercial', 'mixed'].includes(propertyType)) return null
  if (status !== 'active' && status !== 'inactive') return null
  if (!['draft', 'published', 'retired'].includes(publicationState)) return null

  const unitCount = identity.unit_count
  const estimatedValue = identity.estimated_value
  if (!Number.isInteger(unitCount) || unitCount < 0) return null
  if (!Number.isFinite(estimatedValue) || estimatedValue < 0) return null

  return {
    id,
    slug,
    portfolio_id: source.portfolio_id.trim(),
    place_id: placeId,
    management,
    identity: {
      name: identity.name.trim(),
      image_url: identity.image_url.trim(),
      property_type: propertyType as Property['identity']['property_type'],
      unit_count: unitCount,
      estimated_value: estimatedValue,
      estimated_value_currency: identity.estimated_value_currency.trim(),
    },
    status: status as Property['status'],
    publication_state: publicationState as Property['publication_state'],
    created: source.created,
    updated: source.updated,
  }
}

export function canonicalPropertyManual(value: unknown): PropertyManual | null {
  const source = asRecord(value)
  if (!source) return null

  const manual: Record<string, Record<string, string>> = {}
  for (const sectionName of Object.keys(PropertyManualModel) as Array<
    keyof PropertyManual
  >) {
    const sectionSource = asRecord(source[sectionName])
    if (!sectionSource) return null

    const sectionModel = PropertyManualModel[sectionName]
    const section: Record<string, string> = {}
    for (const fieldName of Object.keys(sectionModel) as Array<
      keyof PropertyManual[typeof sectionName]
    >) {
      if (typeof sectionSource[fieldName as string] !== 'string') {
        return null
      }
      section[fieldName as string] = sectionSource[fieldName as string] as string
    }
    manual[sectionName as string] = section
  }

  return manual as unknown as PropertyManual
}

export function composePropertySurface(parts: {
  source?: Property | null
  appSupport?: Partial<AppProperty> | null
}): PropertySurface | null {
  // Stored legacy roots can still carry access/manual fields. They are not part
  // of the canonical root surface and must not leak back through a broad spread.
  const canonicalRoot = canonicalPropertyRoot(parts.source)
  if (!canonicalRoot) return null

  return {
    ...canonicalRoot,
    operator_ids: safeStringArray(parts.appSupport?.operator_ids),
    team_ids: safeStringArray(parts.appSupport?.team_ids),
    join_requests: safeStringArray(parts.appSupport?.join_requests),
  }
}

const formatEstimatedValue = (value: unknown, currency: unknown) => {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return ''
  const currencyCode = safeString(currency).toUpperCase() || defaultCurrency

  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${currencyCode} ${Math.round(amount).toLocaleString('en-GB')}`
  }
}

export namespace PropertyCard {
  export type Card = {
    id: string
    to: string
    title: string
    subtitle: string
    meta: string
    imageUrl: string
    status: string
    badges: string[]
    summary: string
  }
}

export function usePropertyInterface() {
  type PropertyPill = PropertyCard.Card
  type PropertyCell = PropertyCard.Card
  type PropertyPreview = PropertyCard.Card
  type PropertyProfile = PropertyCard.Card

  function buildInterface(
    target?: Property | null | undefined
  ): PropertyCard.Card | null {
    if (!target) return null

    const id = safeString(target.id)
    if (!id) return null

    const identity = target.identity
    const title = safeString(identity.name) || id
    const subtitle = safeString(target.place_id)
      ? 'Canonical place linked'
      : 'Place not linked'
    const estimatedValue = formatEstimatedValue(
      identity.estimated_value,
      identity.estimated_value_currency
    )

    const meta =
      [
        safeString(identity.property_type),
        `units ${Number.isFinite(identity.unit_count) ? identity.unit_count : 0}`,
        estimatedValue ? `est. ${estimatedValue}` : '',
      ]
        .filter(Boolean)
        .join(' · ') || 'No metadata'

    const slug = safeString((target as any).slug)

    return {
      id,
      to: slug ? `/${PropertyStorage.rootCollection}/${encodeURIComponent(slug)}` : '',
      title,
      subtitle,
      meta,
      imageUrl: safeString(identity.image_url),
      status: '',
      badges: [],
      summary: '',
    }
  }

  const toInterface = buildInterface

  function pill(target?: Property | null | undefined): PropertyPill | null {
    return buildInterface(target)
  }

  function cell(target?: Property | null | undefined): PropertyCell | null {
    return buildInterface(target)
  }

  function preview(
    target?: Property | null | undefined
  ): PropertyPreview | null {
    return buildInterface(target)
  }

  function profile(
    target?: Property | null | undefined
  ): PropertyProfile | null {
    return buildInterface(target)
  }

  return {
    surface: composePropertySurface,
    interface: toInterface,
    pill,
    cell,
    preview,
    profile,
  }
}
