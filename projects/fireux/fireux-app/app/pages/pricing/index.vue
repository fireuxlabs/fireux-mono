<template>
  <PublicPricingPage
    description="Navigate FireUX pricing for users, apps, and ecosystems with clear setup and maintenance models."
    :plans="hubPlans"
  />
</template>

<script setup lang="ts">
const detailButton = {
  color: 'neutral' as const,
  variant: 'soft' as const,
  trailingIcon: 'i-lucide-arrow-right',
}

const hubPlans = [
  {
    id: 'users',
    title: 'Users',
    description: 'Join for free or upgrade.',
    price: '$10',
    billingCycle: '/month',
    features: ['Upgrade access'],
    button: {
      ...detailButton,
      label: 'Details',
      to: '/pricing/users',
    },
  },
  {
    id: 'apps',
    title: 'Apps',
    description: 'Launch your app.',
    price: 'From $400',
    billingPeriod: 'setup',
    features: ['Maintenance from $30/month'],
    highlight: true,
    scale: true,
    button: {
      ...detailButton,
      label: 'Details',
      to: '/pricing/apps',
    },
  },
  {
    id: 'ecosystems',
    title: 'Ecosystems',
    description: 'Run your own ecosystem.',
    price: '$1,000',
    billingPeriod: 'setup',
    features: ['Tenant apps from $300 setup'],
    button: {
      ...detailButton,
      label: 'Details',
      to: '/ecosystems/pricing',
    },
  },
] as const

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'pricing',
    label: 'Pricing',
    icon: 'i-lucide-badge-dollar-sign',
    order: 80,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Pricing · FireUX',
  description:
    'Navigate FireUX pricing for users, apps, and ecosystems with clear setup and maintenance models.',
})
</script>
