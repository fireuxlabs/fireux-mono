<template>
  <AppPricingPage
    description="Pricing for SEO profile, discovery, and lead products."
  >
    <section class="rounded-md border border-default bg-default p-5">
      <p class="text-sm font-semibold uppercase tracking-wide text-muted">
        Product pricing
      </p>
      <h2 class="mt-2 text-2xl font-semibold text-highlighted">
        SEO marketplace products live in Products.
      </h2>
      <p class="mt-3 text-muted">
        Find My SEO pricing explains profile, discovery, and lead packages. The
        actual buyable records belong in the shared Products system.
      </p>
    </section>

    <template #actions>
      <UButton to="/products" icon="i-lucide-box" size="lg">
        View products
      </UButton>
    </template>
  </AppPricingPage>
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
  title: 'Pricing - Find My SEO',
  description:
    'Find My SEO pricing for SEO profile, discovery, and lead products.',
})
</script>
