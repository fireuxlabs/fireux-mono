<!-- Concurrent edit — 2026-07-20 23:38 CEST — Final app CSS pass: semantic colors. -->
<template>
  <UPage>
    <UPageHeader class="border-b-0"
      title="Onboarding"
      description="Pick a product and run the fulfillment onboarding flow."
    />

    <UPageBody class="pagebody space-y-6">
      <UCard>
        <div class="space-y-4">
          <div>
            <p class="text-sm font-medium text-highlighted">Product</p>
            <p class="text-xs text-muted">
              Select the product to onboard.
            </p>
          </div>
          <USelect
            v-model="selectedSlug"
            :options="productOptions"
            placeholder="Select a product"
          />
        </div>
      </UCard>

      <div v-if="selectedProduct">
        <ProductViewOnboarding :product="selectedProduct" />
      </div>
      <UAlert
        v-else
        color="warning"
        title="No products found"
        description="Create a product first, then come back to run onboarding."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from '#imports'
import { useProductCollection } from 'fireux-products/runtime/product/composables/firestore/fetch/useProductCollection'
import type { Product } from 'fireux-products/runtime/product/models/product.model'

definePageMeta({
  layout: 'default',
  title: 'Onboarding',
  nav: {
    key: 'onboarding',
    label: 'Onboarding',
    icon: 'i-lucide-clipboard-check',
    order: 25,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})

useSeoMeta({
  title: 'Onboarding',
  description: 'Run fulfillment onboarding for a product.',
})

const route = useRoute()
const router = useRouter()
const { products } = useProductCollection()

const selectedSlug = ref<string>(String(route.query.product || ''))

const productOptions = computed(() =>
  (products.value ?? []).map((product) => ({
    label: product.name || product.slug,
    value: product.slug,
  }))
)

const selectedProduct = computed(() =>
  (products.value ?? []).find((product) => product.slug === selectedSlug.value)
)

watch(
  () => products.value,
  (list: Product[] | undefined) => {
    if (!selectedSlug.value && list?.length) {
      selectedSlug.value = list[0]?.slug || ''
    }
  },
  { immediate: true }
)

watch(
  () => selectedSlug.value,
  (value: string) => {
    const nextQuery = { ...route.query }
    if (value) {
      nextQuery.product = value
    } else {
      delete nextQuery.product
    }
    router.replace({ query: nextQuery })
  }
)
</script>
