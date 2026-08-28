import {
  usePricing,
  type PricingProfile,
} from 'fireux-core/runtime/app/composables/pricing/usePricing'

const miseboxPricingProfile = {
  appName: 'Misebox',
  contactEmail: 'misebox@misebox.app',
  workspaceName: 'Kitchen Workspace',
  entityName: 'Kitchen',
  entityPluralName: 'Kitchens',
  free: [
    'Use one Kitchen workspace',
    'Publish one Menu',
    'Advertise permanent and temporary Jobs',
    'Coordinate one active temporary Engagement',
  ],
  professional: [
    'Publish multiple Menus',
    'Manage team access and permissions',
    'Run preparation, stations, tables, and orders',
    'Manage suppliers, costing, and Kitchen finance',
  ],
} as const satisfies PricingProfile

export function useMiseboxPricing() {
  return usePricing(miseboxPricingProfile)
}
