<template>
  <div>
    <UCard>
      <template #header>
        <h1>🗺️ Places Collection</h1>
      </template>
      <p>Total Places: {{ totalPlaces }}</p>
      <DevJsonPanel :data="{ total: totalPlaces, places: placesList }" />
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePlaces } from '../../composables/fireux/firestore/objects/place/system/usePlaces'

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-ext-places',
    label: 'Places (Ext)',
    icon: 'i-lucide-map-pin',
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})

const { collection } = usePlaces()
const placesList = computed(() => collection.value ?? [])
const totalPlaces = computed(() => placesList.value.length)
</script>
