import {
  usePricing,
  type PricingProfile,
} from 'fireux-core/runtime/composables/fireux/pricing/usePricing'

const slapPricingProfile = {
  appName: 'Slap',
  contactEmail: 'fire@fireux.app',
  consoleName: 'Commerce Console',
  free: [
    'Create one brand workspace',
    'Publish products and stories',
    'Use the Commerce Console',
    'Build the first public brand surface',
  ],
  pro: [
    'Manage products, collections, and drops',
    'Publish stories and gallery content',
    'Operate the branded storefront',
    'Give the commerce team Console access',
  ],
} as const satisfies PricingProfile

export function useSlapPricing() {
  return usePricing(slapPricingProfile)
}
