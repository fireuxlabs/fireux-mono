import type { Property } from '../../../../../../models/property.model'

const safeString = (value: unknown) => String(value ?? '').trim()
const defaultCurrency = 'GBP'

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
    const estimatedValue = formatEstimatedValue(
      target.estimated_value,
      target.estimated_value_currency
    )

    const meta =
      [
        safeString(target.property_type),
        `units ${Number.isFinite(target.unit_count) ? target.unit_count : 0}`,
        estimatedValue ? `est. ${estimatedValue}` : '',
      ]
        .filter(Boolean)
        .join(' · ') || 'No metadata'

    return {
      id,
      to: `/properties/${encodeURIComponent(id)}`,
      title,
      subtitle,
      meta,
      imageUrl:
        safeString(target.image_url) || '/img/core/defaults/default-thumbnail.png',
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
