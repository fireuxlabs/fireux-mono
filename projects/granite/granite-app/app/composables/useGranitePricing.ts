import {
  usePricing,
  type PricingProfile,
} from 'fireux-core/runtime/composables/fireux/pricing/usePricing'

const granitePricingProfile = {
  appName: 'Granite',
  contactEmail: 'fire@fireux.app',
  consoleName: 'Portfolio Console',
  free: [
    'Use one Portfolio workspace',
    'Record properties and clients',
    'Use the Portfolio Console',
    'Review the current portfolio structure',
  ],
  pro: [
    'Manage portfolios, properties, and clients',
    'Track compliance, incidents, documents, and tasks',
    'Review portfolio financial signals',
    'Give the portfolio team Console access',
  ],
} as const satisfies PricingProfile

export function useGranitePricing() {
  return usePricing(granitePricingProfile)
}
