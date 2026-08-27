<template>
  <PricingPage
    description="Pricing for multilingual QR pages and translation products."
  >
    <section class="rounded-md border border-default bg-default p-5">
      <p class="text-sm font-semibold uppercase tracking-wide text-muted">
        Product pricing
      </p>
      <h2 class="mt-2 text-2xl font-semibold text-highlighted">
        Translation products live in Products.
      </h2>
      <p class="mt-3 text-muted">
        Sproochli pricing explains language and localisation packages. The actual buyable records belong in the shared Products system.
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
  </PricingPage>
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
  title: 'Pricing - Sproochli',
  description: 'Sproochli pricing for multilingual QR pages and translation products.',
})
</script>
