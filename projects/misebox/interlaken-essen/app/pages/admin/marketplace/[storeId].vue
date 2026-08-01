<template>
  <section
    class="market-page market-storefront"
    aria-labelledby="storefront-title"
  >
    <p v-if="state === 'loading'">{{ copy('market_loading') }}</p>
    <p v-else-if="message" class="is-error" role="alert">{{ message }}</p>
    <MarketplaceCanonicalStorefront
      v-else-if="previewStore"
      :store="previewStore"
      preview
      back-to="/admin/marketplace"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'
import type {
  ManagedMarketplaceStore,
  PublicMarketplaceOffer,
  PublicMarketplaceStore,
} from 'fireux-marketplace/runtime/models/marketplace-api.model'

definePageMeta({ layout: 'marketplace' })

const { copy } = useInterlakenCopy()
const marketplace = useMarketplaceClient()
const storeId = useRouteParam('storeId')
const store = ref<ManagedMarketplaceStore | null>(null)
const state = ref<'loading' | 'idle' | 'error'>('loading')
const message = ref('')

const previewStore = computed<PublicMarketplaceStore | null>(() => {
  if (!store.value) return null
  const offers = store.value.offers.flatMap<PublicMarketplaceOffer>(offer =>
    offer.price
      ? [{
          id: offer.id,
          title: offer.title,
          description: offer.description,
          unit_label: offer.unit_label,
          price: offer.price,
          section_ids: offer.section_ids,
          fulfilment_methods: offer.fulfilment_methods,
        }]
      : []
  )
  return {
    id: store.value.id,
    slug: store.value.slug,
    name: store.value.name,
    description: store.value.description,
    locality: store.value.locality,
    image_url: store.value.image_url,
    image_alt: store.value.image_alt,
    section_ids: store.value.section_ids,
    fulfilment_methods: store.value.fulfilment_methods,
    offers,
  }
})

onMounted(async () => {
  try {
    store.value = (await marketplace.managedStore(storeId.value)).store
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
