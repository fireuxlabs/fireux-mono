<template>
  <UPage>
    <UPageHeader title="Products" />
    <UPageBody>
      <UPageGrid>
        <UPageCard
          v-for="plan in plans"
          :key="plan.id"
          :title="plan.title"
          :description="plan.description"
          :to="plan.to"
        />
      </UPageGrid>
      <FireState
        :outcome="catalogue.outcome"
        entity="Products"
        :error="catalogue.error"
      />
      <ProductCollection
        v-if="catalogue.outcome === 'ready'"
        :products="catalogue.products"
        :show-header="false"
      />
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
