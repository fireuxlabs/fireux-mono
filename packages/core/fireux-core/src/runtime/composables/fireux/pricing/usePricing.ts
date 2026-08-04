import { computed } from 'vue'
import type { LandingPricingPlan } from '../../../../types/landing-product'

export type PricingTierId =
  | 'free'
  | 'pro'
  | 'managed'
  | 'your-app'
  | 'your-ecosystem'

export type PricingTier = LandingPricingPlan & {
  id: PricingTierId
  eyebrow: string
  included: readonly string[]
  notIncluded: readonly string[]
  nextStep: string
  priceNote: string
  billingPeriod?: string
}

export type PricingProfile = {
  appName: string
  contactEmail: string
  consoleName: string
  free: readonly string[]
  pro: readonly string[]
  includesEcosystemTier?: boolean
}

export function usePricing(profile: PricingProfile) {
  const appName = computed(() => profile.appName)
  const consoleName = computed(() => profile.consoleName)
  const contactEmail = computed(() => profile.contactEmail)
  const includesEcosystemTier = computed(
    () => profile.includesEcosystemTier === true
  )

  const tiers = computed<readonly PricingTier[]>(() => {
    const common: PricingTier[] = [
      {
        id: 'free',
        eyebrow: `${appName.value} pricing`,
        title: 'Free',
        description: `Use a functional ${consoleName.value} before you pay.`,
        price: 'CHF 0',
        features: [
          profile.free[0] || 'Functional Console',
          profile.free[1] || 'Self-service setup',
          'No monthly charge',
        ],
        included: profile.free,
        notIncluded: [
          'Managed setup or ongoing assistance',
          'A separate branded App',
          'New product development',
        ],
        priceNote: 'No setup fee and no monthly charge.',
        nextStep: 'Create an account and start with the Free Console.',
        to: '/pricing/free',
      },
      {
        id: 'pro',
        eyebrow: `${appName.value} pricing`,
        title: 'Pro',
        description: `Use the fuller ${consoleName.value} and manage it yourself.`,
        price: 'CHF 20',
        billingCycle: '/month',
        features: [
          profile.pro[0] || 'Fuller Console',
          profile.pro[1] || 'Team access',
          'Self-managed',
        ],
        included: ['Everything in Free', ...profile.pro],
        notIncluded: [
          'Hands-on management by FireUX',
          'A separate branded App',
          'New product development',
        ],
        priceNote: 'Billed monthly. No percentage or commission is added.',
        nextStep:
          'Upgrade when the Free Console no longer has enough capacity.',
        to: '/pricing/pro',
      },
      {
        id: 'managed',
        eyebrow: `${appName.value} pricing`,
        title: 'Managed',
        description: `Use ${appName.value} with practical help from FireUX.`,
        price: 'CHF 50',
        billingCycle: '/month',
        features: [
          'Everything in Pro',
          'Setup assistance',
          'Agreed monthly help',
        ],
        included: [
          'Everything in Pro',
          'Initial workspace and product configuration',
          'Help importing the information needed to start',
          'Agreed monthly content or configuration updates',
          'Priority assistance',
        ],
        notIncluded: [
          'New Operations, Tools, or integrations',
          'Unlimited content or operational work',
          'Third-party charges',
        ],
        priceNote:
          'Billed monthly for the product and an agreed level of assistance.',
        nextStep:
          'Choose Managed when you want FireUX to operate the system with you.',
        to: '/pricing/managed',
      },
      {
        id: 'your-app',
        eyebrow: `${appName.value} pricing`,
        title: 'Your App',
        description: includesEcosystemTier.value
          ? 'Launch your own standalone branded FireUX App.'
          : `Launch your own branded App inside the ${appName.value} ecosystem.`,
        price: 'CHF 600',
        billingPeriod: 'setup',
        features: [
          'Your branding',
          'Your web address',
          'Pro or Managed monthly plan',
        ],
        included: [
          'Your name, identity, and approved brand assets',
          'Your own public App doorway and web address',
          includesEcosystemTier.value
            ? 'A standalone App built on the FireUX system'
            : `Connection to the ${appName.value} ecosystem`,
          'Configuration of existing product capabilities',
          'Launch and deployment',
        ],
        notIncluded: [
          'New capabilities that do not already exist',
          'An entirely new product ecosystem',
          'Paid domains or third-party services',
        ],
        priceNote:
          'CHF 600 setup, followed by CHF 20/month Pro or CHF 50/month Managed.',
        nextStep:
          'Choose the monthly plan, confirm the existing capabilities, and prepare the App for launch.',
        to: '/pricing/your-app',
      },
    ]

    if (includesEcosystemTier.value) {
      common.push({
        id: 'your-ecosystem',
        eyebrow: 'FireUX pricing',
        title: 'Your Ecosystem',
        description:
          'Create a product ecosystem that can launch and support its own customer Apps.',
        price: 'CHF 1,200',
        billingPeriod: 'setup',
        features: [
          'Ecosystem setup',
          'CHF 50/month maintenance',
          '50% App revenue share',
        ],
        included: [
          'Your ecosystem identity and main App',
          'A system ready to launch branded customer Apps',
          'Owner access to the Project Console',
          'Hosting, shared FireUX updates, and routine maintenance',
          'Half of each customer App setup and monthly price retained by the ecosystem owner',
        ],
        notIncluded: [
          'New product capabilities or custom integrations',
          'Operating each customer App on the owner’s behalf',
          'Paid domains, transaction fees, or third-party services',
        ],
        priceNote: 'CHF 1,200 setup plus CHF 50/month ecosystem maintenance.',
        nextStep:
          'Define the product boundary, first customer group, and capabilities the ecosystem will own.',
        to: '/pricing/your-ecosystem',
      })
    }

    return common
  })

  const landingTiers = computed(() =>
    tiers.value.filter((tier) => tier.id !== 'your-ecosystem')
  )
  const description = computed(() =>
    includesEcosystemTier.value
      ? 'Start with the Console, launch your own App, or create an ecosystem for customer Apps.'
      : `Start with a functional ${consoleName.value}, upgrade when you need more, or launch your own ${appName.value} App.`
  )

  function getTier(id: string) {
    return tiers.value.find((tier) => tier.id === id)
  }

  return {
    appName,
    consoleName,
    contactEmail,
    description,
    getTier,
    includesEcosystemTier,
    landingTiers,
    tiers,
  }
}
