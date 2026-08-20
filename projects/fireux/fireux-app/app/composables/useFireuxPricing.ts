import {
  usePricing,
  type PricingProfile,
} from 'fireux-core/runtime/composables/fireux/pricing/usePricing'

const fireuxPricingProfile = {
  appName: 'FireUX',
  contactEmail: 'fire@fireux.app',
  workspaceName: 'Project Workspace',
  free: [
    'Use the Project Workspace',
    'Review Apps and Ecosystems',
    'Review Project users and access',
    'Use public FireUX resources',
  ],
  pro: [
    'Manage Apps connected to the Project',
    'Manage Project users, roles, and access',
    'Review App and Ecosystem status',
    'Configure the Project yourself',
  ],
  includesEcosystemTier: true,
} as const satisfies PricingProfile

export function useFireuxPricing() {
  return usePricing(fireuxPricingProfile)
}
