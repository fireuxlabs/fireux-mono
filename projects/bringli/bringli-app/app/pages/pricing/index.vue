<template>
  <div class="space-y-16 pb-20">
    <section class="border-b border-gray-200/60 py-16 dark:border-gray-800/50">
      <UContainer class="space-y-6">
        <UBadge color="primary" variant="soft">Bringli Pricing</UBadge>

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
    description: 'Launch your app in the Bringli ecosystem.',
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
})

useSeoMeta({
  title: 'Pricing · Bringli',
  description: 'Bringli ecosystem pricing for users, apps, and reseller operators.',
})
</script>
