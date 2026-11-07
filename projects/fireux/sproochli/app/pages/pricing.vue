<template>
  <AppPricingPage
    description="Pricing for multilingual QR pages and translation products."
  >
    <UCard as="section">
      <p class="fx-type-caption">Product pricing</p>
      <h2 class="fx-type-section-title">
        Translation products live in Products.
      </h2>
      <p class="fx-type-body">
        Sproochli pricing explains language and localisation packages. The
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
  title: 'Pricing - Sproochli',
  description:
    'Sproochli pricing for multilingual QR pages and translation products.',
})
</script>
