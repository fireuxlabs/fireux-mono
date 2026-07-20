// Concurrent edit — 2026-07-20 22:20 CEST — Both-Entity Authority — Property: validate the Place-linked root and allowlist app access/manual deltas.
import {
  PropertyManualModel,
  PropertyStorage,
  type AppProperty,
  type Property,
  type PropertyManual,
} from '../../../../../../models/property.model'

const safeString = (value: unknown) => String(value ?? '').trim()
const defaultCurrency = 'GBP'
const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
const safeStringArray = (value: unknown) =>
  Array.isArray(value)
    ? [...new Set(value.map((entry) => safeString(entry)).filter(Boolean))]
    : []

export type PropertySurface = Property &
  Pick<AppProperty, 'operator_ids' | 'team_ids' | 'join_requests'> & {
    manual?: PropertyManual
  }

export function canonicalPropertyRoot(source?: Property | null): Property | null {
  const id = safeString(source?.id)
  if (!source || !id) return null
  const slug = safeString(source.slug)
  const placeId = safeString(source.place_id)
  const appScopeState = safeString(source.app_scope_state)
  const appScopeAppId = safeString(source.app_scope_app_id)
  const identity = asRecord(source.identity)
  const created = asRecord(source.created)
  const updated = asRecord(source.updated)
  const propertyType = safeString(identity?.property_type)
  const status = safeString(source.status)

  if (!slug || !placeId || !identity || !created || !updated) return null
  if (!['root_only', 'parent_app', 'tenant_app'].includes(appScopeState)) return null
  if (appScopeState !== 'root_only' && !appScopeAppId) return null
  if (!['residential', 'commercial', 'mixed'].includes(propertyType)) return null
  if (status !== 'active' && status !== 'inactive') return null

  const unitCount = Number(identity.unit_count)
  const estimatedValue = Number(identity.estimated_value)
  if (!Number.isFinite(unitCount) || !Number.isFinite(estimatedValue)) return null

  return {
    id,
    slug,
    portfolio_id: safeString(source.portfolio_id),
    place_id: placeId,
    app_scope_state: appScopeState as Property['app_scope_state'],
    app_scope_app_id: appScopeAppId,
    identity: {
      name: safeString(identity.name),
      image_url: safeString(identity.image_url),
      property_type: propertyType as Property['identity']['property_type'],
      unit_count: unitCount,
      estimated_value: estimatedValue,
      estimated_value_currency: safeString(identity.estimated_value_currency),
    },
    status: status as Property['status'],
    created: source.created,
    updated: source.updated,
  }
}

function exactPropertyManual(value: unknown): PropertyManual | undefined {
  const source = asRecord(value)
  if (!source) return undefined

  const manual: Record<string, Record<string, string>> = {}
  for (const sectionName of Object.keys(PropertyManualModel) as Array<
    keyof PropertyManual
  >) {
    const sectionSource = asRecord(source[sectionName])
    if (!sectionSource) return undefined

    const sectionModel = PropertyManualModel[sectionName]
    const section: Record<string, string> = {}
    for (const fieldName of Object.keys(sectionModel) as Array<
      keyof PropertyManual[typeof sectionName]
    >) {
      if (typeof sectionSource[fieldName as string] !== 'string') {
        return undefined
      }
      section[fieldName as string] = sectionSource[fieldName as string] as string
    }
    manual[sectionName as string] = section
  }

  return manual as unknown as PropertyManual
}

export function composePropertySurface(parts: {
  source?: Property | null
  overlay?: Partial<AppProperty> | null
}): PropertySurface | null {
  // Stored legacy roots can still carry access/manual fields. They are not part
  // of the canonical root surface and must not leak back through a broad spread.
  const canonicalRoot = canonicalPropertyRoot(parts.source)
  if (!canonicalRoot) return null
  const manual = exactPropertyManual(parts.overlay?.manual)

  return {
    ...canonicalRoot,
    operator_ids: safeStringArray(parts.overlay?.operator_ids),
    team_ids: safeStringArray(parts.overlay?.team_ids),
    join_requests: safeStringArray(parts.overlay?.join_requests),
    ...(manual ? { manual } : {}),
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
