<template>
  <UPage>
    <UPageHeader
      title="A menu online. A Kitchen in control."
      description="Host your menu for free, or manage Menus and orders in Kitchen Workspace."
    />
    <UPageBody>
      <UPageGrid class="product-choices">
        <UPageCard
          title="Menu Hosting"
          description="Upload a PDF or image. Get your online menu link and QR for free."
          icon="i-lucide-file-check"
          to="/menu-express"
        />
        <UPageCard
          title="Kitchen Workspace"
          description="Manage Menus and Collection orders with your Kitchen tools."
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
  description: 'Pro, Business, Menu Hosting and Collection Ordering.',
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
