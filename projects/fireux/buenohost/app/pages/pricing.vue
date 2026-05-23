<template>
  <PublicPricingPage
    description="Pricing for digital stay companions and guest guide products."
  >
    <section class="rounded-md border border-default bg-default p-5">
      <p class="text-sm font-semibold uppercase tracking-wide text-muted">
        Product pricing
      </p>
      <h2 class="mt-2 text-2xl font-semibold text-highlighted">
        Guest guide products live in Products.
      </h2>
      <p class="mt-3 text-muted">
        BuenoHost pricing explains the guest-guide packages. The actual buyable records belong in the shared Products system.
      </p>
    </section>

    <template #actions>
      <UButton
        to="/products"
        icon="i-lucide-box"
        size="lg"
      >
        View products
      </UButton>
    </template>
  </PublicPricingPage>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'

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
  title: 'Pricing - BuenoHost',
  description: 'BuenoHost pricing for digital stay companions and guest guide products.',
})
</script>
