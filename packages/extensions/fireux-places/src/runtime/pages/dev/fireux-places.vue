<template>
  <UPage>
    <UPageHeader
      title="Dev · Places (Ext)"
      description="Collection-first view; filter by missing or extra fields (against the runtime Place model)."
    />

    <UPageBody class="space-y-10">
      <DevPlacesDriftPanels :places="places" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePlaces } from '../../composables/fireux/firestore/objects/place/usePlaces'
import type { Place } from '../../models/objects/place.model'

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

const { collection } = usePlaces<Place>()
const places = computed(() => collection.value ?? [])
</script>
