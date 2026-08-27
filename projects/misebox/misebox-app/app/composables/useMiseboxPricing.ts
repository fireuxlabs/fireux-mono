import {
  usePricing,
  type PricingProfile,
} from 'fireux-core/runtime/app/composables/pricing/usePricing'
import { computed } from 'vue'

const miseboxPricingProfile = {
  appName: 'Misebox',
  contactEmail: 'misebox@misebox.app',
  workspaceName: 'Kitchen Workspace',
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
  const pricing = usePricing(miseboxPricingProfile)
  const tiers = computed(() =>
    pricing.tiers.value.map((tier) => {
      if (tier.id === 'pro') {
        return {
          ...tier,
          title: 'Premium',
          description:
            'Run one Kitchen with the complete self-managed Kitchen Workspace.',
          features: [
            'Everything in Free',
            'Complete Kitchen Workspace',
            'Team access and permissions',
          ],
          included: ['Everything in Free', ...miseboxPricingProfile.pro],
          notIncluded: [
            'Multiple Kitchen Workspaces',
            'A separate branded App',
            'Setup, migration, or custom development',
          ],
          nextStep:
            'Choose Premium when one Kitchen needs the complete Workspace.',
          to: '/pricing/premium',
        }
      }

      if (tier.id === 'managed') {
        return {
          ...tier,
          title: 'Business',
          description:
            'Operate multiple Kitchens with the complete Kitchen Workspace.',
          features: [
            'Everything in Premium',
            'Multiple Kitchen Workspaces',
            'Business operating capacity',
          ],
          included: [
            'Everything in Premium',
            'Own and manage multiple Kitchens',
            'Separate Team access for each Kitchen',
            'Kitchen-specific Operations and Reports',
          ],
          notIncluded: [
            'A separate branded App',
            'Setup, migration, or content services',
            'New integrations or custom development',
          ],
          priceNote: 'Billed monthly for multiple-Kitchen capacity.',
          nextStep:
            'Choose Business when the organisation operates more than one Kitchen.',
          to: '/pricing/business',
        }
      }

      if (tier.id === 'your-app') {
        return {
          ...tier,
          features: [
            'Your branding',
            'Your web address',
            'Premium or Business subscription',
          ],
          priceNote:
            'CHF 600 setup, followed by a Premium or Business subscription.',
        }
      }

      return {
        ...tier,
        notIncluded: tier.notIncluded.map((item) =>
          item === 'Managed setup or ongoing assistance'
            ? 'Setup, migration, or content services'
            : item
        ),
      }
    })
  )
  const landingTiers = computed(() => tiers.value)
  const description = computed(
    () =>
      'Run one Kitchen for free, unlock the complete Workspace with Premium, or operate multiple Kitchens with Business.'
  )

  return {
    ...pricing,
    description,
    landingTiers,
    tiers,
  }
}
