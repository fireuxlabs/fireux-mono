<template>
  <div class="space-y-16 pb-20">
    <section class="py-16">
      <UContainer class="space-y-6">
        <UBadge color="primary" variant="soft">Ecosystem ownership</UBadge>

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
        <UPricingPlans :plans="ecosystemPlans" />
      </UContainer>
    </section>

    <section>
      <UContainer class="max-w-xl">
        <UPricingPlan
          title="Console seats"
          description="Wholesale seat pricing for ecosystem operators."
          price="$2.50"
          billing-cycle="/month"
          :features="[
            'Half of app seat pricing',
            'Billed per console seat',
          ]"
        />
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
const ecosystemPlans = [
  {
    id: 'own-ecosystem',
    title: 'Own an ecosystem',
    description: 'Create a dedicated ecosystem and operate the platform layer.',
    price: '$1,000',
    billingPeriod: 'setup',
    features: [
      'Maintenance: $50/month',
      'Dedicated ecosystem layer',
      'Foundation for multi-app growth',
    ],
    highlight: true,
    scale: true,
    button: {
      label: 'View app pricing',
      to: '/pricing/apps',
      color: 'neutral',
      variant: 'soft',
      trailingIcon: 'i-lucide-arrow-right',
    },
  },
  {
    id: 'add-apps',
    title: 'Add apps',
    description: 'Launch apps inside your ecosystem at lower per-app rates.',
    price: '$300',
    billingPeriod: 'per app setup',
    features: [
      'Maintenance: $25/month per app',
      'Lower per-app operating rates',
      'Scales with your ecosystem roadmap',
    ],
    button: {
      label: 'Get started',
      to: '/get-started',
      color: 'neutral',
      variant: 'soft',
      trailingIcon: 'i-lucide-arrow-right',
    },
  },
] as const

definePageMeta({
  layout: 'landing',
})

useSeoMeta({
  title: 'Ecosystem Pricing · FireUX',
  description: 'Create and operate your own FireUX ecosystem with wholesale seat pricing.',
})
</script>
