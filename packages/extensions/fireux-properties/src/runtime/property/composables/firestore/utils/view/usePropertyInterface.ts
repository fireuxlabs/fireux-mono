// Concurrent edit — 2026-07-20 23:00 CEST — Both-Entity Authority — Property: exact-validate published roots and keep collection surfaces free of private manuals.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: name the allowlisted App access input directly.
import {
  PropertyManualModel,
  PropertyStorage,
  type Property,
  type PropertyManual,
} from '../../../../models/property.model.ts'
import { canonicalPropertyRoot } from '../../../../utils/normalize-property'

const safeString = (value: unknown) => String(value ?? '').trim()
const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
export type PropertySurface = Property

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
