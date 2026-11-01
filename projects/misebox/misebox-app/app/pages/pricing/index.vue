<template>
  <UPage>
    <ProductsPlans :tiers="tiers" primary />
    <UPageBody>
      <FireState
        :outcome="catalogue.outcome"
        entity="Products"
        :error="catalogue.error"
      />
      <ProductsServices
        v-if="catalogue.outcome === 'ready'"
        :products="catalogue.products"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useProductCollection } from 'fireux-products/runtime/product/composables/useProductCollection'
const { tiers } = useMiseboxPricing()
const catalogue = reactive(useProductCollection())

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
  title: 'Pricing · Misebox',
  description:
    'Free, Pro and Business plans, Menu Express and Collection Ordering.',
})
</script>
