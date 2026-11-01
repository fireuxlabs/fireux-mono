import { computed } from 'vue'
import {
  usePricing,
  type PricingProfile,
} from 'fireux-core/runtime/app/composables/pricing/usePricing'

const miseboxPricingProfile = {
  appName: 'Misebox',
  includesManaged: false,
  includesEcosystemTier: false,
  contactEmail: 'misebox@misebox.app',
  workspaceName: 'Kitchen Workspace',
  entityName: 'Kitchen',
  entityPluralName: 'Kitchens',
  free: [
    'Use one Kitchen workspace',
    'Use Main and Drinks menus',
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
  const pricing = usePricing(miseboxPricingProfile)
  const tiers = computed(() =>
    pricing.tiers.value.filter((tier) =>
      ['free', 'professional', 'business'].includes(tier.id)
    )
  )
  const products = computed(() =>
    tiers.value.filter((tier) => tier.id !== 'free')
  )
  return { ...pricing, tiers, products }
}
