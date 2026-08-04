import {
  usePricing,
  type PricingProfile,
} from 'fireux-core/runtime/composables/fireux/pricing/usePricing'

const miseboxPricingProfile = {
  appName: 'Misebox',
  contactEmail: 'misebox@misebox.app',
  consoleName: 'Kitchen Console',
  free: [
    'Use one Kitchen workspace',
    'Publish one Menu',
    'Advertise permanent and temporary Jobs',
    'Coordinate one active temporary Engagement',
  ],
  pro: [
    'Publish multiple Menus',
    'Manage team access and permissions',
    'Run preparation, stations, tables, and orders',
    'Manage suppliers, costing, and Kitchen finance',
  ],
} as const satisfies PricingProfile

export function useMiseboxPricing() {
  return usePricing(miseboxPricingProfile)
}
