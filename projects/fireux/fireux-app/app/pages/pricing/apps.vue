<template>
  <div class="space-y-16 pb-20">
    <section class="py-16">
      <UContainer class="space-y-6">
        <UBadge color="primary" variant="soft">App ignition</UBadge>

        <div class="space-y-2">
          <AppBrandWordmark
            size="large"
            class="h-9 w-auto max-w-full object-contain"
            light-src="/img/app/wordmark-light.svg"
            dark-src="/img/app/wordmark-dark.png"
          />
        </div>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <UPricingPlans :plans="appPlans" />
      </UContainer>
    </section>

    <section>
      <UContainer class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Operating model comparison</h2>
        <UPricingTable :tiers="appTableTiers" :sections="appTableSections" />
      </UContainer>
    </section>

    <section>
      <UContainer class="max-w-xl">
        <UPricingPlan
          title="Console users"
          description="All end users are free. Only operational console users are billed."
          price="$5"
          billing-cycle="/month per seat"
          :features="[
            'Discounted seats for app operators',
            'Billed only when a console exists',
          ]"
        />
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
const appPlans = [
  {
    id: 'join-ecosystem',
    title: 'Join an ecosystem',
    description: 'Launch inside an ecosystem operated by FireUX.',
    price: '$600',
    billingPeriod: 'setup',
    features: [
      'Maintenance: $50/month',
      'Hosting included',
      'Operated ecosystem infrastructure',
    ],
    highlight: true,
    scale: true,
    button: {
      label: 'View ecosystems',
      to: '/ecosystems/pricing',
      color: 'neutral' as const,
      variant: 'soft' as const,
      trailingIcon: 'i-lucide-arrow-right',
    },
  },
  {
    id: 'fireux-hosted',
    title: 'FireUX hosted',
    description: 'Launch a new domain without creating an ecosystem yet.',
    price: '$700',
    billingPeriod: 'setup',
    features: [
      'Maintenance: $60/month',
      'Hosted inside FireUX',
      'Managed platform operations',
    ],
    button: {
      label: 'Get started',
      to: '/get-started',
      color: 'neutral' as const,
      variant: 'soft' as const,
      trailingIcon: 'i-lucide-arrow-right',
    },
  },
  {
    id: 'self-hosted',
    title: 'Self hosted',
    description: 'Client owns Firebase, hosting, and infrastructure.',
    price: '$400',
    billingPeriod: 'setup',
    features: [
      'Maintenance: $30/month',
      'Client-managed infrastructure',
      'Lower monthly platform fee',
    ],
    button: {
      label: 'Get started',
      to: '/get-started',
      color: 'neutral' as const,
      variant: 'soft' as const,
      trailingIcon: 'i-lucide-arrow-right',
    },
  },
]

const appTableTiers = [
  {
    id: 'join-ecosystem',
    title: 'Join an ecosystem',
    highlight: true,
  },
  {
    id: 'fireux-hosted',
    title: 'FireUX hosted',
  },
  {
    id: 'self-hosted',
    title: 'Self hosted',
  },
]

const appTableSections = [
  {
    title: 'Pricing',
    features: [
      {
        title: 'Setup',
        tiers: {
          'join-ecosystem': '$600',
          'fireux-hosted': '$700',
          'self-hosted': '$400',
        },
      },
      {
        title: 'Maintenance',
        tiers: {
          'join-ecosystem': '$50/month',
          'fireux-hosted': '$60/month',
          'self-hosted': '$30/month',
        },
      },
    ],
  },
  {
    title: 'Operations',
    features: [
      {
        title: 'Hosting included',
        tiers: {
          'join-ecosystem': true,
          'fireux-hosted': true,
          'self-hosted': false,
        },
      },
      {
        title: 'Client controls infrastructure',
        tiers: {
          'join-ecosystem': false,
          'fireux-hosted': false,
          'self-hosted': true,
        },
      },
      {
        title: 'Fastest launch path',
        tiers: {
          'join-ecosystem': true,
          'fireux-hosted': true,
          'self-hosted': false,
        },
      },
    ],
  },
]

definePageMeta({
  layout: 'landing',
})

useSeoMeta({
  title: 'App Pricing · FireUX',
  description: 'Start with an app. Choose ecosystem-hosted, FireUX-hosted, or self-hosted.',
})
</script>
