import {
  usePricing,
  type PricingProfile,
} from 'fireux-core/runtime/composables/fireux/pricing/usePricing'

const werkboxPricingProfile = {
  appName: 'Werkbox',
  contactEmail: 'fire@fireux.app',
  consoleName: 'Work Console',
  free: [
    'Browse public work',
    'Create a professional or business profile',
    'Apply to published work directly',
    'Use the functional Work Console',
  ],
  pro: [
    'Publish work',
    'Review applications and hire directly',
    'Manage customer and job workspaces',
    'Coordinate the team without a hiring commission',
  ],
} as const satisfies PricingProfile

export function useWerkboxPricing() {
  return usePricing(werkboxPricingProfile)
}
