// Concurrent edit — 2026-07-20 23:00 CEST — Both-Entity Authority — Property: exact-validate published roots and keep collection surfaces free of private manuals.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: name the allowlisted App access input directly.
import {
  PropertyManualModel,
  PropertyStorage,
  type Property,
  type PropertyManual,
} from '../../../../models/property.model.ts'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import { readFireuxEntityManagement } from 'fireux-core/runtime/utils/entity-management'

const safeString = (value: unknown) => String(value ?? '').trim()
const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
const hasOnlyKeys = (
  value: Record<string, unknown>,
  keys: readonly string[]
) => {
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
export type PropertySurface = Property

export function canonicalPropertyRoot(source?: unknown): Property | null {
  const root = asRecord(source)
  if (
    !root ||
    !hasOnlyKeys(root, [
      'id',
      'portfolio_id',
      'place_id',
      'management',
      'identity',
      'valuation',
      'created',
      'updated',
    ])
  )
    return null
  if (
    typeof root.id !== 'string' ||
    typeof root.portfolio_id !== 'string' ||
    typeof root.place_id !== 'string'
  )
    return null
  const id = root.id.trim()
  const placeId = root.place_id.trim()
  const management = readFireuxEntityManagement(root.management)
  const identity = asRecord(root.identity)
  if (
    !isFirestoreDocumentId(id) ||
    !isFirestoreDocumentId(placeId) ||
    (root.portfolio_id.trim() && !isFirestoreDocumentId(root.portfolio_id)) ||
    !management ||
    !identity ||
    !hasOnlyKeys(identity, [
      'name',
      'image_url',
      'property_type',
      'unit_count',
      'slug',
      'status',
      'publication_state',
    ])
  )
    return null
  if (
    typeof identity.name !== 'string' ||
    !identity.name.trim() ||
    typeof identity.image_url !== 'string' ||
    typeof identity.slug !== 'string' ||
    !identity.slug.trim() ||
    typeof identity.unit_count !== 'number' ||
    !Number.isSafeInteger(identity.unit_count) ||
    identity.unit_count < 0 ||
    typeof identity.property_type !== 'string' ||
    !['residential', 'commercial', 'mixed'].includes(identity.property_type) ||
    typeof identity.status !== 'string' ||
    !['active', 'inactive'].includes(identity.status) ||
    typeof identity.publication_state !== 'string' ||
    !['draft', 'published', 'retired'].includes(identity.publication_state)
  )
    return null
  if (
    !validStamp(root.created, ['at', 'by', 'app_id']) ||
    !validStamp(root.updated, ['at', 'by'])
  )
    return null

  let valuation: Property['valuation']
  if (root.valuation !== undefined) {
    const value = asRecord(root.valuation)
    if (
      !value ||
      !hasOnlyKeys(value, ['estimated_value', 'currency_code']) ||
      typeof value.currency_code !== 'string' ||
      (value.estimated_value !== null &&
        (typeof value.estimated_value !== 'number' ||
          !Number.isFinite(value.estimated_value) ||
          value.estimated_value < 0))
    )
      return null
    const currency = value.currency_code.trim().toUpperCase()
    if (
      (currency && !/^[A-Z]{3}$/.test(currency)) ||
      (value.estimated_value !== null && !currency)
    )
      return null
    valuation = {
      estimated_value: value.estimated_value as number | null,
      currency_code: currency,
    }
  }
  return {
    id,
    portfolio_id: root.portfolio_id.trim(),
    place_id: placeId,
    management,
    identity: {
      name: identity.name.trim(),
      image_url: identity.image_url.trim(),
      slug: identity.slug.trim(),
      property_type:
        identity.property_type as Property['identity']['property_type'],
      unit_count: identity.unit_count,
      status: identity.status as Property['identity']['status'],
      publication_state:
        identity.publication_state as Property['identity']['publication_state'],
    },
    ...(valuation ? { valuation } : {}),
    created: root.created as Property['created'],
    updated: root.updated as Property['updated'],
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
      section[fieldName as string] = sectionSource[
        fieldName as string
      ] as string
    }
    manual[sectionName as string] = section
  }

  return manual as unknown as PropertyManual
}

export function composePropertySurface(parts: {
  source?: Property | null
}): PropertySurface | null {
  // Identity, optional valuation and relationships follow the exact owned root contract.
  // Private manuals and access records are never part of this surface.
  const canonicalRoot = canonicalPropertyRoot(parts.source)
  if (!canonicalRoot) return null

  return canonicalRoot
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

    const meta =
      [
        safeString(identity.property_type),
        `units ${Number.isFinite(identity.unit_count) ? identity.unit_count : 0}`,
      ]
        .filter(Boolean)
        .join(' · ') || 'No metadata'

    const slug = safeString(identity.slug)

    return {
      id,
      to: slug
        ? `/${PropertyStorage.rootCollection}/${encodeURIComponent(slug)}`
        : '',
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
