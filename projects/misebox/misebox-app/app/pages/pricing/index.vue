<template>
  <PublicPricingPage
    description="Misebox ecosystem pricing for users, apps, and reseller operators."
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
    description: 'Join the ecosystem and create your account.',
    price: 'Free',
    features: ['Upgrade to console access at $5/month'],
    button: {
      ...detailButton,
      label: 'Details',
      to: '/pricing/users',
    },
  },
  {
    id: 'apps',
    title: 'Apps',
    description: 'Launch your app in the Misebox ecosystem.',
    price: '$600',
    billingPeriod: 'setup',
    features: ['Maintenance: $50/month', 'Console seats: $5/month'],
    highlight: true,
    scale: true,
    button: {
      ...detailButton,
      label: 'Details',
      to: '/pricing/apps',
    },
  },
  {
    id: 'resellers',
    title: 'Resellers',
    description: 'Operate and resell apps in your market.',
    price: '$300',
    billingPeriod: 'per app setup',
    features: ['Maintenance: $25/month', 'Console seats: $2.50/month'],
    button: {
      ...detailButton,
      label: 'Details',
      to: '/pricing/resellers',
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
  title: 'Pricing · Misebox',
  description: 'Misebox ecosystem pricing for users, apps, and reseller operators.',
})
</script>
