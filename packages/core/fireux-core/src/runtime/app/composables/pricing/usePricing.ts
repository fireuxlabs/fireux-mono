import { computed } from 'vue'
import type { LandingPricingPlan } from '../../../../types/landing-product'

export type AppPricingTierId =
  | 'free'
  | 'professional'
  | 'business'
  | 'managed'
  | 'your-app'
  | 'your-ecosystem'

export type AppPricingTier = LandingPricingPlan & {
  id: AppPricingTierId
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
  workspaceName: string
  entityName: string
  entityPluralName: string
  free: readonly string[]
  professional: readonly string[]
  includesManaged?: boolean
  includesEcosystemTier?: boolean
}

const prices = {
  professionalEntityMonthly: 20,
  businessMonthly: 100,
  managedMonthly: 100,
  appSetup: 600,
  appAdditionalEntitySetup: 100,
  appEntityMonthly: 50,
  ecosystemSetup: 1_200,
  ecosystemMonthly: 50,
} as const

const chf = (amount: number) => `CHF ${amount.toLocaleString('en-CH')}`

export function usePricing(profile: PricingProfile) {
  const appName = computed(() => profile.appName)
  const workspaceName = computed(() => profile.workspaceName)
  const entityName = computed(() => profile.entityName)
  const entityPluralName = computed(() => profile.entityPluralName)
  const contactEmail = computed(() => profile.contactEmail)
  const includesManaged = computed(() => profile.includesManaged !== false)
  const includesEcosystemTier = computed(
    () => profile.includesEcosystemTier === true
  )

  const tiers = computed<readonly AppPricingTier[]>(() => {
    const entity = entityName.value
    const entities = entityPluralName.value
    const common: AppPricingTier[] = [
      {
        id: 'free',
        eyebrow: `${appName.value} pricing`,
        title: 'Free',
        description: `Use one ${entity} with the bounded Free ${workspaceName.value}.`,
        price: 'CHF 0',
        features: [
          profile.free[0] || `One ${entity}`,
          profile.free[1] || `Bounded ${workspaceName.value}`,
          'No monthly charge',
        ],
        included: profile.free,
        notIncluded: [
          `Complete Professional ${workspaceName.value} capabilities`,
          `Multiple ${entities}`,
          'A separate branded App',
        ],
        priceNote: 'No setup fee and no monthly charge.',
        nextStep: `Create an account and start with one ${entity}.`,
        to: '/pricing/free',
      },
      {
        id: 'professional',
        eyebrow: `${appName.value} pricing`,
        title: 'Professional',
        description: `Operate one ${entity} with the complete self-managed ${workspaceName.value}.`,
        price: chf(prices.professionalEntityMonthly),
        billingCycle: '/month',
        features: [
          'Everything in Free',
          `One complete ${entity}`,
          'Self-managed',
        ],
        included: ['Everything in Free', ...profile.professional],
        notIncluded: [
          `Multiple ${entities}`,
          'Managed service',
          'A separate branded App',
        ],
        priceNote: `Includes one fully enabled ${entity}.`,
        nextStep: `Choose Professional to operate one complete ${entity}.`,
        to: '/pricing/professional',
      },
      {
        id: 'business',
        eyebrow: `${appName.value} pricing`,
        title: 'Business',
        description: `Operate multiple ${entities} from one ${appName.value} account.`,
        price: chf(prices.businessMonthly),
        billingCycle: '/month',
        features: [
          'Everything in Professional',
          `Multiple ${entities}`,
          `${chf(prices.professionalEntityMonthly)} per ${entity} each month`,
        ],
        included: [
          'Everything in Professional',
          `Multi-${entity} operating access`,
          `Separate Team authority for each ${entity}`,
          `Add ${entities} for ${chf(prices.professionalEntityMonthly)} each per month`,
        ],
        notIncluded: [
          'Managed service',
          'A separate branded App',
          'New product development',
        ],
        priceNote: `${chf(prices.businessMonthly)}/month plus ${chf(prices.professionalEntityMonthly)}/month for each ${entity}.`,
        nextStep: `Choose Business when you operate more than one ${entity}.`,
        to: '/pricing/business',
      },
    ]

    if (includesManaged.value) {
      common.push({
        id: 'managed',
        eyebrow: `${appName.value} service`,
        title: 'Managed',
        description: `Add an interchangeable manager to selected ${entities}.`,
        price: chf(prices.managedMonthly),
        billingCycle: '/month',
        features: [
          'Add to Professional or Business',
          `Select the ${entities} to manage`,
          `${chf(prices.professionalEntityMonthly)} per managed ${entity} each month`,
        ],
        included: [
          'Agreed recurring management work',
          'Manager participation through the relevant Team',
          `Management for selected ${entities}`,
        ],
        notIncluded: [
          'The underlying Professional or Business subscription',
          'Unlimited operational work',
          'New capabilities, integrations, or product development',
        ],
        priceNote: `Additional to the subscription: ${chf(prices.managedMonthly)}/month plus ${chf(prices.professionalEntityMonthly)}/month for each managed ${entity}.`,
        nextStep: `Choose the ${entities} that need agreed recurring management.`,
        to: '/pricing/managed',
      })
    }

    common.push({
      id: 'your-app',
      eyebrow: `${appName.value} pricing`,
      title: 'Your App',
      description: `Launch a separate branded App that manages its own ${entities}.`,
      price: chf(prices.appSetup),
      billingPeriod: 'setup',
      features: [
        `One ${entity} included at setup`,
        `${chf(prices.appAdditionalEntitySetup)} per additional ${entity} setup`,
        `${chf(prices.appEntityMonthly)}/month per ${entity}`,
      ],
      included: [
        'Your App name, identity, and approved brand assets',
        'Your public App doorway and web address',
        `Creation, onboarding, and migration for one ${entity}`,
        `Managed operation at ${chf(prices.appEntityMonthly)}/month per ${entity}`,
      ],
      notIncluded: [
        'New capabilities that do not already exist',
        'An entirely new product ecosystem',
        'Paid domains or third-party services',
      ],
      priceNote: `${chf(prices.appSetup)} setup including one ${entity}; ${chf(prices.appAdditionalEntitySetup)} setup per additional ${entity}; then ${chf(prices.appEntityMonthly)}/month per ${entity}.`,
      nextStep: `Confirm the App identity, existing capabilities, and initial ${entities}.`,
      to: '/pricing/your-app',
    })

    if (includesEcosystemTier.value) {
      common.push({
        id: 'your-ecosystem',
        eyebrow: 'FireUX pricing',
        title: 'Your Ecosystem',
        description:
          'Own a product ecosystem that creates Apps and manages its own SaaS customers.',
        price: chf(prices.ecosystemSetup),
        billingPeriod: 'setup',
        features: [
          'Ecosystem setup',
          `${chf(prices.ecosystemMonthly)}/month maintenance`,
          '50% customer App revenue share',
        ],
        included: [
          'Your ecosystem identity and Main App',
          'A system ready to create customer Apps',
          'Owner control of customer relationships and management',
          'Hosting, shared FireUX updates, and routine maintenance',
          'Half of each customer App setup and monthly price retained by the ecosystem owner',
        ],
        notIncluded: [
          'FireUX management of the ecosystem’s SaaS customers',
          'New product capabilities or custom integrations',
          'Paid domains, transaction fees, or third-party services',
        ],
        priceNote: `${chf(prices.ecosystemSetup)} setup plus ${chf(prices.ecosystemMonthly)}/month ecosystem maintenance.`,
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
      ? 'Create one Project, operate multiple Projects, launch your own App, or create an ecosystem for customer Apps.'
      : `Start with one ${entityName.value}, operate multiple ${entityPluralName.value} with Business, or launch your own App.`
  )

  function getTier(id: string) {
    return tiers.value.find((tier) => tier.id === id)
  }

  return {
    appName,
    workspaceName,
    entityName,
    entityPluralName,
    contactEmail,
    description,
    getTier,
    includesManaged,
    includesEcosystemTier,
    landingTiers,
    tiers,
  }
}
