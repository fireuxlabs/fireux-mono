<template>
  <div class="fx-page-stack fx-page-stack--comfortable">
    <section class="py-16">
      <UContainer class="space-y-6">
        <UBadge color="primary" variant="soft">App launches</UBadge>

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
        <h2 class="text-xl font-semibold text-highlighted">Operating model comparison</h2>
        <UPricingTable :tiers="appTableTiers" :sections="appTableSections" />
      </UContainer>
    </section>

    <section>
      <UContainer class="max-w-xl">
        <UPricingPlan
          title="Additional console users"
          description="Your first operator is included. Add paid console seats only when the operating team grows."
          price="$3"
          billing-cycle="/month per seat"
          :features="[
            'First operator included',
            'End users remain free',
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
    title: 'Starter launch',
    description: 'Launch one focused workflow inside the nearest FireUX ecosystem.',
    price: '$150',
    billingPeriod: 'setup',
    features: [
      'Maintenance: $15/month',
      'Hosting included',
      'Brand and first operator included',
    ],
    highlight: true,
    scale: true,
    button: {
      label: 'Ask about this launch',
      to: 'mailto:fire@fireux.app?subject=FireUX%20starter%20launch',
      color: 'neutral' as const,
      variant: 'soft' as const,
      trailingIcon: 'i-lucide-arrow-right',
    },
  },
  {
    id: 'fireux-hosted',
    title: 'Managed launch',
    description: 'Launch a branded app directly with FireUX when no existing ecosystem fits.',
    price: '$250',
    billingPeriod: 'setup',
    features: [
      'Maintenance: $25/month',
      'Hosted inside FireUX',
      'Brand, first operator, and launch support included',
    ],
    button: {
      label: 'Ask about this launch',
      to: 'mailto:fire@fireux.app?subject=FireUX%20managed%20launch',
      color: 'neutral' as const,
      variant: 'soft' as const,
      trailingIcon: 'i-lucide-arrow-right',
    },
  },
  {
    id: 'self-hosted',
    title: 'Own infrastructure',
    description: 'Use the FireUX app foundation while owning Firebase and hosting yourself.',
    price: '$200',
    billingPeriod: 'setup',
    features: [
      'Maintenance: $15/month',
      'Client-managed infrastructure',
      'Best for customers with technical ownership',
    ],
    button: {
      label: 'Ask about this launch',
      to: 'mailto:fire@fireux.app?subject=FireUX%20own%20infrastructure%20launch',
      color: 'neutral' as const,
      variant: 'soft' as const,
      trailingIcon: 'i-lucide-arrow-right',
    },
  },
]

const appTableTiers = [
  {
    id: 'join-ecosystem',
    title: 'Starter launch',
    highlight: true,
  },
  {
    id: 'fireux-hosted',
    title: 'Managed launch',
  },
  {
    id: 'self-hosted',
    title: 'Own infrastructure',
  },
]

const appTableSections = [
  {
    title: 'Pricing',
    features: [
      {
        title: 'Setup',
        tiers: {
          'join-ecosystem': '$150',
          'fireux-hosted': '$250',
          'self-hosted': '$200',
        },
      },
      {
        title: 'Maintenance',
        tiers: {
          'join-ecosystem': '$15/month',
          'fireux-hosted': '$25/month',
          'self-hosted': '$15/month',
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
  description: 'Launch a focused FireUX app from $150 setup with maintenance from $15 per month.',
})
</script>
