import {
  usePricing,
  type PricingProfile,
} from 'fireux-core/runtime/app/composables/pricing/usePricing'

const bringliPricingProfile = {
  appName: 'Bringli',
  contactEmail: 'fire@fireux.app',
  workspaceName: 'Supply Workspace',
  entityName: 'Supplier',
  entityPluralName: 'Suppliers',
  free: [
    'Create a supplier profile',
    'Publish basic supplier information',
    'Use the Supplier Workspace',
    'Review catalogue, ingredient, and item records',
  ],
  professional: [
    'Manage complete supplier catalogues',
    'Connect ingredients and supplied items',
    'Coordinate coverage and delivery work',
    'Give the supply team Workspace access',
  ],
} as const satisfies PricingProfile

export function useBringliPricing() {
  return usePricing(bringliPricingProfile)
}
