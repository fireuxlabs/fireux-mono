<template>
  <UPage>
    <UPageHeader class="pageheader"
      title="FireUX modules"
      description="Browse published module records in the FireUX ecosystem."
    />

    <UPageBody class="pagebody">
      <EntityIndexCta
        title="Published module directory"
        description="Modules are the reusable FireUX capabilities that apps and ecosystems compose."
        family="console"
        source="products/{productId}"
        :count-label="`${moduleCollection.length} module${moduleCollection.length === 1 ? '' : 's'}`"
        :actions="actions"
      />

      <ProductCollectionManager
        v-if="featuredModules.length"
        :collection="featuredModules"
        title="Featured modules"
        description="Selected module records for FireUX."
        :show-search="false"
        :show-variant-toggle="false"
        initial-variant="cell"
      />

      <ProductCollectionManager
        :collection="moduleCollection"
        title="All modules"
        description="Browse the full published module collection."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppPublicSettings } from 'fireux-core/runtime/composables/fireux/app/useAppPublicSettings'
import { useProductFetch } from 'fireux-products/runtime/composables/fireux/firestore/product/fetch/useProductFetch'
import type { FirebaseProduct } from 'fireux-products/runtime/models/product.model'

definePageMeta({
  tag: 'modules',
  nav: {
    key: 'modules',
    label: 'Modules',
    icon: 'i-lucide-puzzle',
    order: 70,
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
  },
  title: 'Modules',
  description: 'Browse published FireUX modules.',
})

useSeoMeta({
  title: 'FireUX Modules',
  description:
    'Browse published FireUX modules available to apps and ecosystems.',
})

const { products } = useProductFetch()
const { featuredSlugsFor } = useAppPublicSettings()
const featuredModuleSlugs = featuredSlugsFor('module')
const clean = (value: unknown) => String(value ?? '').trim()

const moduleCollection = computed(() =>
  (products.value ?? [])
    .filter((product) => product.product_type === 'module')
    .filter((product) => product.active !== false)
    .filter((product) => clean(product.id))
    .sort((a, b) => clean(a.name).localeCompare(clean(b.name)))
)
const featuredModules = computed(() => {
  const bySlug = new Map<string, FirebaseProduct>()

  for (const entry of moduleCollection.value) {
    const slug = clean(entry.slug) || clean(entry.id)
    if (slug) bySlug.set(slug, entry)
  }

  return featuredModuleSlugs.value
    .map((slug) => bySlug.get(slug))
    .filter((entry): entry is FirebaseProduct => Boolean(entry))
})

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
