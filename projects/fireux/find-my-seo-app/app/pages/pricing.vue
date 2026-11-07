<template>
  <AppPricingPage
    description="Pricing for SEO profile, discovery, and lead products."
  >
    <UCard as="section">
      <p class="fx-type-caption">Product pricing</p>
      <h2 class="fx-type-section-title">
        SEO marketplace products live in Products.
      </h2>
      <p class="fx-type-body">
        Find My SEO pricing explains profile, discovery, and lead packages. The
        actual buyable records belong in the shared Products system.
      </p>
    </UCard>

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
