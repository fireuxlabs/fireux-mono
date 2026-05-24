<template>
  <UPage>
    <UPageHeader class="pageheader"
      title="Modules"
      description="Platform module index for the current FireUX runtime."
    />

    <UPageBody class="pagebody">
      <EntityIndexCta
        title="Modules index"
        description="Browse the FireUX module catalogue available to this runtime and use learn-more pages as the public reference surface."
        family="console"
        source="runtime module catalogue"
        :count-label="`${moduleCollection.length} module${moduleCollection.length === 1 ? '' : 's'}`"
        :actions="actions"
      />
      <ProductCollectionManager :collection="moduleCollection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProductFetch } from 'fireux-products/runtime/composables/fireux/firestore/product/fetch/useProductFetch'

definePageMeta({
  tag: 'modules',
  nav: {
    key: 'modules',
    label: 'Modules',
    icon: 'i-lucide-puzzle',
    desktop: true,
    mobile: true,
  },
})

useSeoMeta({
  title: 'FireUX Modules',
  description: 'FireUX modules available for this runtime.',
})

const { products } = useProductFetch()
const moduleCollection = computed(() =>
  (products.value ?? []).filter((product) => product.product_type === 'module')
)

const actions = [
  {
    label: 'Project',
    cta: 'Open Project Console',
    to: '/console/project',
    icon: 'i-lucide-layout-dashboard',
  },
  {
    label: 'Apps Index',
    cta: 'Browse apps',
    to: '/apps',
    icon: 'i-lucide-app-window',
  },
  {
    label: 'Guide',
    cta: 'Learn more',
    to: '/modules/learn-more',
    icon: 'i-lucide-book-open',
  },
] as const
</script>
