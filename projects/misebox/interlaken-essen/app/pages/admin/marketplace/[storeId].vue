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
import { onMounted, ref } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'
import type {
  PublicMarketplaceStore,
} from 'fireux-marketplace/runtime/models/marketplace-api.model'

definePageMeta({ layout: 'marketplace' })

const { copy } = useInterlakenCopy()
const marketplace = useMarketplaceClient()
const storeId = useRouteParam('storeId')
const store = ref<PublicMarketplaceStore | null>(null)
const state = ref<'loading' | 'idle' | 'error'>('loading')
const message = ref('')

onMounted(async () => {
  try {
    store.value = (await marketplace.previewStore(storeId.value)).store
    state.value = 'idle'
  } catch {
    state.value = 'error'
    message.value = copy('market_generic_error')
  }
})

useSeoMeta({
  title: () =>
    `${store.value?.name || copy('market_admin_preview')} – Interlaken Essen`,
})
</script>
