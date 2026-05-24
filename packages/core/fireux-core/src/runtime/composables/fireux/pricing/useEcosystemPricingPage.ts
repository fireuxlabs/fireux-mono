import { computed } from 'vue'
import { useFireUXConfig } from '../app/FireUXConfig'

const detailButton = {
  color: 'neutral' as const,
  variant: 'soft' as const,
  trailingIcon: 'i-lucide-arrow-right',
}

export function useEcosystemPricingPage() {
  const fireux = useFireUXConfig()

  const ecosystemName = computed(() =>
    String(fireux.appName || fireux.appShortName || 'Ecosystem').trim()
  )

  const description = computed(() =>
    `${ecosystemName.value} pricing.`
  )

  const plans = computed(() => [
    {
      id: 'free',
      title: 'Free',
      description: 'Basic ecosystem access.',
      price: 'Free',
      features: [
        'Starter console',
        'Public pages',
        'Test workspace',
      ],
      button: {
        ...detailButton,
        label: 'Details',
        to: '/pricing/users',
      },
    },
    {
      id: 'premium',
      title: 'Premium',
      description: 'For active operators who need private tools.',
      price: '$5',
      billingCycle: '/month',
      features: [
        'Operator console',
        'Private records',
        'Private workflow tools',
      ],
      button: {
        ...detailButton,
        label: 'Details',
        to: '/pricing/users',
      },
    },
    {
      id: 'tenant-app',
      title: 'Tenant App',
      description: `Launch your app inside the ${ecosystemName.value} ecosystem.`,
      price: '$600',
      billingPeriod: 'setup',
      features: [
        'Maintenance: $50/month',
        'Console seats: $5/month',
        `Hosted inside ${ecosystemName.value}`,
      ],
      button: {
        ...detailButton,
        label: 'Details',
        to: '/pricing/apps',
      },
    },
    {
      id: 'partner',
      title: `${ecosystemName.value} Partner`,
      description: `For partners bringing new businesses into ${ecosystemName.value}.`,
      price: '$300',
      billingPeriod: 'per tenant app setup',
      features: [
        'Partner setup share',
        'Maintenance share: $25/month',
        'For new customer apps, not your own app',
      ],
      button: {
        ...detailButton,
        label: 'How it works',
        to: '/pricing/partners',
      },
    },
  ])

  const planGroups = computed(() => [
    {
      id: 'users',
      title: 'Users',
      plans: plans.value.filter((plan) => ['free', 'premium'].includes(plan.id)),
    },
    {
      id: 'systems',
      title: 'Systems',
      plans: plans.value.filter((plan) => ['tenant-app', 'partner'].includes(plan.id)),
    },
  ])

  const seoTitle = computed(() => `Pricing · ${ecosystemName.value}`)
  const seoDescription = computed(() =>
    `${ecosystemName.value} pricing for user access, premium operator tools, tenant app setup, and partner-led customer systems.`
  )
  return {
    ecosystemName,
    description,
    plans,
    planGroups,
    seoTitle,
    seoDescription,
  }
}
