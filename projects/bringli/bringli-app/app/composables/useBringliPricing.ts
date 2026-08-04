import {
  usePricing,
  type PricingProfile,
} from 'fireux-core/runtime/composables/fireux/pricing/usePricing'

const bringliPricingProfile = {
  appName: 'Bringli',
  contactEmail: 'fire@fireux.app',
  consoleName: 'Supply Console',
  free: [
    'Create a supplier profile',
    'Publish basic supplier information',
    'Use the Supplier Console',
    'Review catalogue, ingredient, and item records',
  ],
  pro: [
    'Manage complete supplier catalogues',
    'Connect ingredients and supplied items',
    'Coordinate coverage and delivery work',
    'Give the supply team Console access',
  ],
} as const satisfies PricingProfile

export function useBringliPricing() {
  return usePricing(bringliPricingProfile)
}
