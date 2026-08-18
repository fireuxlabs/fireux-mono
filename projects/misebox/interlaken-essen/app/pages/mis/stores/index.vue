<template>
  <section class="market-page market-personal market-workbench">
    <div class="market-personal__content">
      <header class="market-workbench__header">
        <div>
          <p class="market-eyebrow">{{ copy('sell') }}</p>
          <h1>{{ copy('market_my_stores') }}</h1>
          <p class="market-intro">{{ copy('market_manage_stores') }}</p>
        </div>
        <NuxtLink to="/mis" class="market-storefront__back">
          <UIcon name="i-lucide-arrow-left" aria-hidden="true" />
          {{ copy('my_interlaken_essen') }}
        </NuxtLink>
      </header>

      <p v-if="state === 'loading'">{{ copy('market_loading') }}</p>
      <p v-else-if="state === 'error'" role="alert">
        {{ copy('market_generic_error') }}
      </p>

      <div v-else class="market-workbench__grid">
        <NuxtLink
          v-for="store in stores"
          :key="store.id"
          :to="`/mis/stores/${store.id}`"
          class="market-workbench__card"
        >
          <span>{{ storeStateLabel(store.publication_state) }}</span>
          <h2>{{ store.name }}</h2>
          <p>{{ store.locality.postal_code }} · {{ store.locality.label }}</p>
          <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
        </NuxtLink>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'
import type {
  MarketplaceStore,
  MarketplaceStoreState,
} from 'fireux-marketplace/runtime/marketplace-store/models/marketplace.model'

definePageMeta({ layout: 'marketplace' })
const { copy } = useInterlakenCopy()
const marketplace = useMarketplaceClient()
const stores = ref<MarketplaceStore[]>([])
const state = ref<'loading' | 'idle' | 'error'>('loading')

function storeStateLabel(state: MarketplaceStoreState) {
  return copy(`market_store_${state}` as
    | 'market_store_draft'
    | 'market_store_pending_review'
    | 'market_store_published'
    | 'market_store_paused')
}

async function load() {
  state.value = 'loading'
  try {
    stores.value = (await marketplace.managedStores()).items
    state.value = 'idle'
  } catch {
    state.value = 'error'
  }
}

onMounted(load)
</script>
