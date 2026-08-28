import {
  usePricing,
  type PricingProfile,
} from 'fireux-core/runtime/app/composables/pricing/usePricing'

// Future editable pricing starts from the Professional Entity unit. A unit
// change must preview its cascade into Business, Managed-capable generated
// Apps, App setup, and per-Entity prices for review; it must never silently
// rewrite published offers. FireUX itself does not sell Managed service.
const fireuxPricingProfile = {
  appName: 'FireUX',
  contactEmail: 'fire@fireux.app',
  workspaceName: 'Project Workspace',
  entityName: 'Project',
  entityPluralName: 'Projects',
  free: [
    'Use the Project Workspace',
    'Review Apps and Ecosystems',
    'Review Project users and access',
    'Use public FireUX resources',
  ],
  professional: [
    'Manage Apps connected to the Project',
    'Manage Project users, roles, and access',
    'Review App and Ecosystem status',
    'Configure the Project yourself',
  ],
  includesManaged: false,
  includesEcosystemTier: true,
} as const satisfies PricingProfile

export function useFireuxPricing() {
  return usePricing(fireuxPricingProfile)
}
