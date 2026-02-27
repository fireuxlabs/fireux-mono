import type { Property } from '../../../../../../models/property.model'

const safeString = (value: unknown) => String(value ?? '').trim()

export namespace PropertyCard {
  export type Card = {
    id: string
    to: string
    title: string
    subtitle: string
    meta: string
  }
}

export function usePropertyInterface() {
  function card(target?: Property | null | undefined): PropertyCard.Card | null {
    if (!target) return null

    const id = safeString(target.id)
    if (!id) return null

    const title = safeString(target.name) || id
    const subtitle =
      [safeString(target.address_line), safeString(target.city), safeString(target.postcode)]
        .filter(Boolean)
        .join(' · ') || 'Address not set'

    const meta =
      [
        safeString(target.property_type),
        `units ${Number.isFinite(target.unit_count) ? target.unit_count : 0}`,
      ]
        .filter(Boolean)
        .join(' · ') || 'No metadata'

    return {
      id,
      to: `/properties/${encodeURIComponent(id)}`,
      title,
      subtitle,
      meta,
    }
  }

  function searchText(target: Property): string {
    return [target.id, target.name, target.address_line, target.city, target.postcode]
      .map((value) => safeString(value))
      .join(' ')
      .toLowerCase()
      .trim()
  }

  return {
    card,
    searchText,
  }
}
