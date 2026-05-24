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
    `Pricing for testing ${ecosystemName.value}, upgrading operator access, and launching tenant apps.`
  )

  const plans = computed(() => [
    {
      id: 'free',
      title: 'Free',
      description: `Try the ${ecosystemName.value} console before you commit.`,
      price: 'Free',
      features: [
        'Test console access',
        'Create your account',
        'Explore public ecosystem pages',
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
      description: `For people actively operating records inside ${ecosystemName.value}.`,
      price: '$5',
      billingCycle: '/month',
      features: [
        'Operator console access',
        'Private workflow tools',
        'Priority access to ecosystem features',
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
      highlight: true,
      scale: true,
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

  const seoTitle = computed(() => `Pricing · ${ecosystemName.value}`)
  const seoDescription = computed(() => description.value)

  return {
    ecosystemName,
    description,
    plans,
    seoTitle,
    seoDescription,
  }
}
