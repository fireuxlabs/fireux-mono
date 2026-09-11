<template>
  <section
    class="market-page market-storefront"
    aria-labelledby="storefront-title"
  >
    <p v-if="state === 'loading'">{{ copy('market_loading') }}</p>
    <p v-else-if="message" class="is-error" role="alert">{{ message }}</p>
    <MarketplaceCanonicalStorefront
      v-else-if="store"
      :store="store"
      preview
      back-to="/admin/marketplace"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'
import type { MarketplaceStoreDirectoryEntry } from 'fireux-marketplace/runtime/marketplace-store/models/marketplace-api.model'

definePageMeta({ layout: 'marketplace' })

const { copy } = useInterlakenCopy()
const storeId = useRouteParam('storeId')
const { currentUser: liveUser } = useAuth()
const liveRecords = useLiveAsyncData(
  computed(
    () => `market-preview:${liveUser.value?.uid || ''}:${storeId.value}`
  ),
  (liveFetch) => useMarketplaceClient(liveFetch).previewStore(storeId.value),
  { server: false }
)
const store = computed<MarketplaceStoreDirectoryEntry | null>(
  () => liveRecords.data.value?.store || null
)
const state = computed(() =>
  liveRecords.pending.value
    ? 'loading'
    : liveRecords.error.value
      ? 'error'
      : 'idle'
)
const message = computed(() =>
  liveRecords.error.value ? copy('market_generic_error') : ''
)

useSeoMeta({
  title: () =>
    `${store.value?.name || copy('market_admin_preview')} – Interlaken Essen`,
})
</script>
