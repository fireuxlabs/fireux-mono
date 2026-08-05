<template>
  <NuxtLink :to="target" class="market-seller-card">
    <div class="market-canonical-card__art" aria-hidden="true">
      <img
        v-if="store.image_url"
        :src="store.image_url"
        :alt="store.image_alt"
      >
      <span v-else>
        <UIcon name="i-lucide-store" />
      </span>
    </div>
    <div class="market-seller-card__body">
      <span>{{ stateLabel }}</span>
      <h2>{{ store.name }}</h2>
      <p class="market-seller-card__place">
        {{ store.locality.postal_code }} · {{ store.locality.label }}
      </p>
      <p>{{ store.description }}</p>
      <strong class="market-seller-card__action">
        {{ actionLabel }}
        <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
      </strong>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'
import type {
  PublicMarketplaceStore,
} from 'fireux-marketplace/runtime/models/marketplace-api.model'

const props = defineProps<{ store: PublicMarketplaceStore }>()
const { copy } = useInterlakenCopy()
const isPublished = computed(
  () => !props.store.publication_state || props.store.publication_state === 'published'
)
const target = computed(() =>
  isPublished.value
    ? `/marktplatz/${props.store.slug}`
    : `/admin/marketplace/${props.store.id}`
)
const stateLabel = computed(() =>
  isPublished.value ? copy('market_live_store') : copy('market_draft_preview')
)
const actionLabel = computed(() =>
  isPublished.value ? copy('storefront_open_shop') : copy('market_admin_preview')
)
</script>
