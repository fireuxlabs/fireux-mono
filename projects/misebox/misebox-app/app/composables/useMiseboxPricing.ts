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
    'Use Food and Drinks menus',
    'Advertise permanent and temporary Jobs',
    'Coordinate one active temporary Engagement',
  ],
  professional: [
    'Create and publish custom regular Menus',
    'Manage the Kitchen team and invitations',
    'Manage dishes, recipes, stations, and orders',
    'Review completed gross sales and record waste',
  ],
} as const satisfies PricingProfile

export function useMiseboxPricing() {
  return usePricing(miseboxPricingProfile)
}
