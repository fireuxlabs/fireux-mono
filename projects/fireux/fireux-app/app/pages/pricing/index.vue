<template>
  <div class="space-y-16 pb-20">
    <section class="border-b border-gray-200/60 py-16 dark:border-gray-800/50">
      <UContainer class="space-y-6">
        <UBadge color="primary" variant="soft">FireUX Pricing</UBadge>

        <h1 class="text-4xl font-semibold text-gray-900 dark:text-white">
          Pricing
        </h1>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <UPricingPlans :plans="hubPlans" />
      </UContainer>
    </section>

  </div>
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
    features: ['Maintenance: $50/month'],
    button: {
      ...detailButton,
      label: 'Details',
      to: '/pricing/ecosystems',
    },
  },
] as const

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'pricing',
    label: 'Pricing',
    icon: 'i-lucide-badge-dollar-sign',
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
