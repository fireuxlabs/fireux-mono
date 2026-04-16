import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { FirebaseProduct } from '../../../../../../models/product.model'

export namespace ProductCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    avatarUrl: string
    imageUrl: string

    // Primary display fields
    title: string
    subtitle: string
    summary: string
    status: string

    name: string
    description: string

    // Status/label chips
    badges: string[]
  }
}

export function useProductInterface() {
  type ProductPill = ProductCard.Card
  type ProductCell = ProductCard.Card
  type ProductPreview = ProductCard.Card
  type ProductProfile = ProductCard.Card

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
      safeString(product.main_image) || safeString(product.images?.[0]?.url)
    const id = safeString(product.id).trim()
    const slug = safeString(product.slug).trim() || id
    const name = safeString(product.name)
    const tagline = safeString(product.tagline)
    const description = safeString(product.description)
    const productType = safeString(product.product_type).trim()
    const solutionIds = new Set(['fireux-app', 'fireux-template'])
    const to =
      productType === 'module'
        ? `/modules/${slug}`
        : solutionIds.has(slug) ||
            productType === 'saas_app' ||
            productType === 'template'
          ? `/solutions/${slug}`
          : `/products/${slug}`

    return {
      id,
      to: slug ? to : '',

      avatarUrl: imageUrl,
      imageUrl,
      title: name,
      subtitle: tagline || description,
      summary: description,
      status: productType,

      name,
      description,
      badges: buildBadges(product),
    }
  }

  function buildInterface(
    target?: FirebaseProduct | null | undefined
  ): ProductCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  const toInterface = buildInterface

  function pill(
    target?: FirebaseProduct | null | undefined
  ): ProductPill | null {
    return buildInterface(target)
  }

  function cell(
    target?: FirebaseProduct | null | undefined
  ): ProductCell | null {
    return buildInterface(target)
  }

  function preview(
    target?: FirebaseProduct | null | undefined
  ): ProductPreview | null {
    return buildInterface(target)
  }

  function profile(
    target?: FirebaseProduct | null | undefined
  ): ProductProfile | null {
    return buildInterface(target)
  }

  return { interface: toInterface, pill, cell, preview, profile }
}
