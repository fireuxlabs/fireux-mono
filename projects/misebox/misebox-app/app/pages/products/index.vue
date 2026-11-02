<template>
  <UPage>
    <UPageHeader
      title="A menu online. A Kitchen in control."
      description="Choose help with your menu, or run the tools yourself in Kitchen Workspace."
    />
    <UPageBody>
      <UPageGrid class="product-choices">
        <UPageCard
          title="Have your menu prepared"
          description="We turn your PDF or photos into a reviewed digital menu. Quoted separately."
          icon="i-lucide-file-check"
          to="#services"
        />
        <UPageCard
          title="Use the tools yourself"
          description="Prepare Menus and manage Collection orders. No separate service purchase; your plan limits and Kitchen access apply."
          icon="i-lucide-panels-top-left"
          to="#plans"
        />
      </UPageGrid>
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

const { tiers: plans } = useMiseboxPricing()
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

<style scoped>
.product-choices {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
@media (max-width: 640px) {
  .product-choices {
    grid-template-columns: 1fr;
  }
}
</style>
