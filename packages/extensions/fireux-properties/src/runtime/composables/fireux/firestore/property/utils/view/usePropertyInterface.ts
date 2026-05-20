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
    const subtitle =
      [
        safeString(identity.address_line),
        safeString(identity.city),
        safeString(identity.postcode),
      ]
        .filter(Boolean)
        .join(' · ') || 'Address not set'
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
      to: slug ? `/properties/${encodeURIComponent(slug)}` : '',
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

  return { interface: toInterface, pill, cell, preview, profile }
}
