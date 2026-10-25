<template>
  <section
    class="market-page market-directory"
    aria-labelledby="marketplace-title"
  >
    <div class="market-directory__content">
      <header class="market-directory__heading">
        <p class="market-eyebrow">{{ copy('marketplace_eyebrow') }}</p>
        <h1 id="marketplace-title">{{ copy('marketplace_title') }}</h1>
        <p class="market-intro">{{ copy('marketplace_intro') }}</p>
      </header>

      <div v-if="stores.length" class="market-seller-grid">
        <MarketplaceCanonicalSellerCard
          v-for="store in stores"
          :key="store.id"
          :store="store"
        />
      </div>

      <div v-else class="market-directory__empty">
        <UIcon name="i-lucide-store" aria-hidden="true" />
        <div>
          <h2>{{ copy('marketplace_empty_title') }}</h2>
          <p>{{ copy('marketplace_empty_body') }}</p>
        </div>
        <NuxtLink
          to="/auth?mode=sign-up&redirect=/mis"
          class="market-action market-action--light"
        >
          <UIcon name="i-lucide-circle-plus" aria-hidden="true" />
          <strong>{{ copy('register_business') }}</strong>
          <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
        </NuxtLink>
      </div>

      <FireDiagnosticsDebugPanel
        object-origin="fetched"
        launcher
        include-route
        title="Marketplace Stores (JSON)"
        context="marketplace directory · Store projections with Offers kept as joined child transport"
        :objects="stores"
        :derived="{
          truncated: Boolean((preview || data)?.truncated),
          preview: Boolean(preview),
        }"
        :default-open="false"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { useLiveFetch } from 'fireux-core/runtime/composables/fireux/firestore/useLiveFetch'
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { MarketplaceStoreDirectoryPage } from 'fireux-marketplace/runtime/marketplace-store/models/marketplace-api.model'

definePageMeta({
  layout: 'marketplace',
})

const { copy } = useInterlakenCopy()
const { currentUser, hasAuthState } = useAuth()
const { data } = await useLiveFetch<MarketplaceStoreDirectoryPage>(
  '/api/marketplace-stores',
  { default: () => ({ items: [], truncated: false }) }
)
const previewRead = useLiveAsyncData<MarketplaceStoreDirectoryPage | null>(
  computed(() => `market-preview:${currentUser.value?.uid || ''}`),
  async (liveFetch) => {
    const user = currentUser.value
    if (!hasAuthState.value || !user) return null
    return liveFetch<MarketplaceStoreDirectoryPage>(
      '/api/marketplace-stores?visibility=all',
      {
        headers: { Authorization: `Bearer ${await user.getIdToken()}` },
      }
    )
  },
  { server: false, watch: [hasAuthState] }
)
const preview = computed(() =>
  previewRead.error.value ? null : previewRead.data.value
)
const stores = computed(() => preview.value?.items || data.value?.items || [])

useSeoMeta({
  title: () => copy('marketplace_seo_title'),
  description: () => copy('marketplace_seo_description'),
})
</script>
