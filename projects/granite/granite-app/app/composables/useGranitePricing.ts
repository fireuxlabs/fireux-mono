import {
  usePricing,
  type PricingProfile,
} from 'fireux-core/runtime/app/composables/pricing/usePricing'

const granitePricingProfile = {
  appName: 'Granite',
  contactEmail: 'fire@fireux.app',
  workspaceName: 'Portfolio Workspace',
  entityName: 'Portfolio',
  entityPluralName: 'Portfolios',
  free: [
    'Use one Portfolio workspace',
    'Record properties and clients',
    'Use the Portfolio Workspace',
    'Review the current portfolio structure',
  ],
  professional: [
    'Manage portfolios, properties, and clients',
    'Track compliance, incidents, documents, and tasks',
    'Review portfolio financial signals',
    'Give the portfolio team Workspace access',
  ],
} as const satisfies PricingProfile

export function useGranitePricing() {
  return usePricing(granitePricingProfile)
}
