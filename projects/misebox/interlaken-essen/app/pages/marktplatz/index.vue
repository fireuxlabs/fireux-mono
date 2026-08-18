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
        <NuxtLink to="/auth?mode=sign-up&redirect=/mis" class="market-action market-action--light">
          <UIcon name="i-lucide-circle-plus" aria-hidden="true" />
          <strong>{{ copy('register_business') }}</strong>
          <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type {
  PublicMarketplaceStoreListResponse,
} from 'fireux-marketplace/runtime/marketplace-store/models/marketplace-api.model'

definePageMeta({
  layout: 'marketplace',
})

const { copy } = useInterlakenCopy()
const { currentUser, hasAuthState } = useAuth()
const { data } = await useFetch<PublicMarketplaceStoreListResponse>(
  '/api/public/marketplace/stores',
  { default: () => ({ items: [], truncated: false }) }
)
const preview = ref<PublicMarketplaceStoreListResponse | null>(null)
const stores = computed(() => preview.value?.items || data.value?.items || [])

async function requestAdminPreview() {
  preview.value = null
  const user = currentUser.value
  if (!import.meta.client || !hasAuthState.value || !user) return
  try {
    const token = await user.getIdToken()
    preview.value = await $fetch<PublicMarketplaceStoreListResponse>(
      '/api/public/marketplace/stores?visibility=all',
      { headers: { Authorization: `Bearer ${token}` } }
    )
  } catch {
    // Published shops remain available when this user has no preview authority.
  }
}

if (import.meta.client) {
  watch(
    [hasAuthState, () => currentUser.value?.uid || ''],
    () => void requestAdminPreview(),
    { immediate: true, flush: 'post' }
  )
}

useSeoMeta({
  title: () => copy('marketplace_seo_title'),
  description: () => copy('marketplace_seo_description'),
})
</script>
