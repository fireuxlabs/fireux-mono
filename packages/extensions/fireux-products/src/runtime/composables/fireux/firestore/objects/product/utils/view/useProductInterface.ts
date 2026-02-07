import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { FirebaseProduct } from '../../../../../../../models/objects/product.model'

export namespace ProductCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    avatarUrl: string

    // Primary display fields
    title: string
    subtitle: string

    name: string
    description: string

    // Secondary media (empty string means unset)
    imageUrl: string

    // Status/label chips
    badges: string[]
  }
}

export function useProductInterface() {
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CHF: 'CHF ',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
  }

  const formatMoney = (unitAmount: number, currency: string) => {
    const value = unitAmount / 100
    const rounded =
      Math.abs(value - Math.round(value)) < 0.00001
        ? String(Math.round(value))
        : value.toFixed(2)
    const iso = currency?.toUpperCase() || 'USD'
    const symbol = currencySymbols[iso] || `${iso} `
    return `${symbol}${rounded}`
  }

  const buildBadges = (product: FirebaseProduct): string[] => {
    const prices = Array.isArray(product.prices) ? product.prices : []
    const setup = prices.find(
      (price) =>
        price?.metadata?.kind === 'setup_fee' || price?.type === 'one_time'
    )
    const monthly = prices.find(
      (price) => price?.type === 'recurring' && price?.interval === 'month'
    )

    const badges: string[] = []
    if (setup?.unit_amount && setup.currency) {
      badges.push(`${formatMoney(setup.unit_amount, setup.currency)}`)
    }
    if (monthly?.unit_amount && monthly.currency) {
      badges.push(`${formatMoney(monthly.unit_amount, monthly.currency)}/mo`)
    }
    return badges
  }

  function map(product: FirebaseProduct): ProductCard.Card {
    const imageUrl =
      safeString(product.main_image) ||
      safeString(product.images?.[0]?.url)
    const id = safeString(product.id).trim()
    const name = safeString(product.name)
    const tagline = safeString(product.tagline)
    const description = safeString(product.description)

    return {
      id,
      to: id ? `/products/${id}` : '',

      avatarUrl: imageUrl,
      title: name,
      subtitle: tagline || description,

      name,
      description,

      imageUrl,
      badges: buildBadges(product),
    }
  }

  function card(target?: FirebaseProduct | null | undefined): ProductCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  function searchText(product: FirebaseProduct): string {
    const name = safeString(product.name)
    const id = safeString(product.id)
    return `${name} ${id}`.trim().toLowerCase()
  }

  return { card, searchText }
}
