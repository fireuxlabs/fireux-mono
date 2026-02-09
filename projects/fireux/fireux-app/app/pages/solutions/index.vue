<template>
  <UPage>
    <UPageHeader
      title="Solutions"
      description="Dedicated offer pages powered by the live FireUX products catalog."
    />

    <UPageBody class="space-y-6">
      <UCard>
        <template #header>
          <div class="space-y-2">
            <h2 class="text-xl font-semibold">FireUX App</h2>
            <p class="text-sm text-muted-foreground">
              Hosted and maintained by FireUX. Products + Blogs included by default.
            </p>
          </div>
        </template>

        <div class="flex flex-wrap gap-2">
          <UButton to="/solutions/fireux-app" color="primary" variant="solid">
            View Product
          </UButton>
          <UButton to="/products/fireux-app" color="neutral" variant="outline">
            Buy Now
          </UButton>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="space-y-2">
            <h2 class="text-xl font-semibold">FireUX Template</h2>
            <p class="text-sm text-muted-foreground">
              Self-hosted developer starter. Built on the same FireUX canon.
            </p>
          </div>
        </template>

        <div class="flex flex-wrap gap-2">
          <UButton to="/solutions/fireux-template" color="primary" variant="solid">
            View Product
          </UButton>
          <UButton to="/products/fireux-template" color="neutral" variant="outline">
            Buy Template
          </UButton>
        </div>
      </UCard>

      <ProductCollectionManager
        :collection="nonModuleProducts"
      />

      <DevJson
        v-if="isDev"
        :title="'Solutions (JSON)'"
        context="fireux-app solutions · filtered non-module products"
        :data="{ all: products, products: nonModuleProducts }"
        :default-open="false"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import ProductCollectionManager from 'fireux-products/runtime/components/organisms/Product/Collection/Manager.vue'
import { useProductFetch } from 'fireux-products/runtime/composables/fireux/firestore/product/fetch/useProductFetch'
import type { FirebaseProduct } from 'fireux-products/runtime/models/product.model'
import { computed } from 'vue'

definePageMeta({
  layout: 'default',
  title: 'Solutions',
  description: 'FireUX app and template solutions.',
  nav: {
    key: 'solutions',
    label: 'Solutions',
    icon: 'i-lucide-layout-template',
    order: 18,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  name: 'SolutionsIndexPage',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Solutions` })

const { products } = useProductFetch()
const isDev = import.meta.dev

const isModuleProduct = (product: FirebaseProduct) => {
  const metadata = (product.metadata ?? {}) as Record<string, any>
  const kind = String(metadata.kind || '').toLowerCase()
  const category = String(metadata.category || '').toLowerCase()
  const productType = String(product.product_type || '').toLowerCase()
  return (
    kind.includes('module') ||
    category.includes('module') ||
    productType.includes('module')
  )
}

const nonModuleProducts = computed(() =>
  (products.value ?? []).filter((product) => !isModuleProduct(product))
)
</script>
