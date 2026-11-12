export interface PricingPlan {
  id?: string
  title?: string
  description?: string
  price?: string
  priceCurrency?: string
  [key: string]: unknown
}

export interface PricingPlanGroup {
  id?: string
  title?: string
  description?: string
  plans: ReadonlyArray<PricingPlan>
}

export function normalizePricingPlanGroups(
  planGroups: ReadonlyArray<PricingPlanGroup>,
  plans: ReadonlyArray<PricingPlan>
): PricingPlanGroup[] {
  if (planGroups.length) return [...planGroups]
  if (!plans.length) return []

  return [
    {
      id: 'plans',
      plans: [...plans],
    },
  ]
}

function priceAmount(price?: string): string {
  const value = String(price || '').trim()
  if (!value || value.toLowerCase() === 'free') return '0'
  return value.replace(/[^0-9.]/g, '') || '0'
}

export function buildPricingOfferCatalog(input: {
  name: string
  description?: string
  groups: ReadonlyArray<PricingPlanGroup>
}) {
  if (!input.groups.length) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    itemListElement: input.groups.map((group) => ({
      '@type': 'OfferCatalog',
      ...(group.title ? { name: group.title } : {}),
      itemListElement: group.plans.map((plan) => ({
        '@type': 'Offer',
        name: plan.title,
        ...(plan.description ? { description: plan.description } : {}),
        price: priceAmount(plan.price),
        priceCurrency: plan.priceCurrency || 'USD',
        ...(group.title ? { category: group.title } : {}),
      })),
    })),
  }
}
