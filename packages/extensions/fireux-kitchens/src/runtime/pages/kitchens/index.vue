<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <KitchenCTA />
      <KitchenCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { usePlaces } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/usePlaces'
import { computed } from 'vue'
import { useKitchenFetch } from '../../composables/fireux/firestore/objects/kitchen/fetch/useKitchenFetch'

definePageMeta({
  nav: {
    key: 'kitchens',
    label: 'Kitchens',
    icon: 'i-lucide-chef-hat',
    order: 55,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Kitchens',
  description: 'Kitchen overlays resolved for this runtime.',
  layout: 'default',
  name: 'KitchensIndexPage',
})

const pageTitle = 'Kitchens'
const pageDescription =
  'Create a kitchen and browse all kitchens available to this runtime.'

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })

const { kitchens } = useKitchenFetch()
const { collection: placesCollection } = usePlaces<Record<string, any>>()

const placesById = computed(() => {
  const map = new Map<string, Record<string, any>>()
  for (const place of placesCollection.value ?? []) {
    if (place?.id) map.set(String(place.id), place)
  }
  return map
})

const mergedKitchens = computed(() =>
  (kitchens.value ?? []).map((kitchen) => {
    const place = placesById.value.get(String(kitchen.id))
    if (!place) return kitchen
    const name = kitchen.name || place.name || ''
    const formattedAddress = kitchen.formatted_address || place.formatted_address || ''
    const searchTerm = kitchen.search_term || `${name} ${formattedAddress}`.toLowerCase().trim()
    const searchTermNormalized =
      kitchen.search_term_normalized || searchTerm
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
    return {
      ...place,
      ...kitchen,
      id: kitchen.id,
      name,
      formatted_address: formattedAddress,
      lat: Number.isFinite(kitchen.lat)
        ? kitchen.lat
        : Number.isFinite(place.lat)
          ? place.lat
          : 0,
      lng: Number.isFinite(kitchen.lng)
        ? kitchen.lng
        : Number.isFinite(place.lng)
          ? place.lng
          : 0,
      place_image: kitchen.place_image || place.place_image || '',
      website: kitchen.website || '',
      search_term: searchTerm,
      search_term_normalized: searchTermNormalized,
    }
  })
)

const collection = computed(() => mergedKitchens.value)
</script>
