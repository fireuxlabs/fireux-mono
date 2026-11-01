<template>
  <UPage>
    <UPageHero
      headline="Misebox for food businesses"
      title="Good food. Less friction."
      description="Get your menu online. Take Collection orders. Bring the work together in your Kitchen."
      :links="[
        {
          label: 'Explore the tools',
          to: '#services',
          trailingIcon: 'i-lucide-arrow-down',
        },
        { label: 'Compare plans', to: '#plans', variant: 'outline' },
      ]"
    />
    <UPageBody>
      <FireState
        :outcome="catalogue.outcome"
        entity="Products"
        :error="catalogue.error"
      />
      <ProductsServices
        v-if="catalogue.outcome === 'ready'"
        id="services"
        :products="catalogue.products"
      />
      <ProductsPlans id="plans" :tiers="plans" />
    </UPageBody>
  </UPage>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import { useProductCollection } from 'fireux-products/runtime/product/composables/useProductCollection'

const { products: plans } = useMiseboxPricing()
const catalogue = reactive(useProductCollection())
definePageMeta({
  layout: 'default',
  title: 'Products',
  name: 'MiseboxProductsIndexPage',
  nav: {
    key: 'products',
    label: 'Products',
    icon: 'i-lucide-box',
    order: 20,
    position: 'top',
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
  },
})
useSeoMeta({
  title: 'Products · Misebox',
  description: 'Pro, Business, Menu Express and Collection Ordering.',
})
</script>
