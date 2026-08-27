import {
  usePricing,
  type PricingProfile,
} from 'fireux-core/runtime/app/composables/pricing/usePricing'

const slapPricingProfile = {
  appName: 'Slap',
  contactEmail: 'fire@fireux.app',
  workspaceName: 'Commerce Workspace',
  free: [
    'Create one brand workspace',
    'Publish products and stories',
    'Use the Commerce Workspace',
    'Build the first public brand surface',
  ],
  pro: [
    'Manage products, collections, and drops',
    'Publish stories and gallery content',
    'Operate the branded storefront',
    'Give the commerce team Workspace access',
  ],
} as const satisfies PricingProfile

export function useSlapPricing() {
  return usePricing(slapPricingProfile)
}
