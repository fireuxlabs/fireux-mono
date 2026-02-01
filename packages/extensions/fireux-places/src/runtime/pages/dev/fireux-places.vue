<template>
  <UPage>
    <UPageHeader
      title="Dev · Places (Ext)"
      description="Collection-first view; filter by missing or extra fields (against the runtime Place model)."
    />

    <UPageBody class="space-y-10">
      <DevPlaceDummy @ready="setDummyPlace" />

      <UCard>
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-3">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Places collection
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Browse places resolved for this runtime and filter by model drift.
              </p>
              <DevDriftToolbar
                :drift-kind="driftKind"
                :selected-field="selectedField"
                :filter-options="filterOptions"
                :copy-label="'Copy drift · Places'"
                :copy-payload="driftCopyPayload"
                @update:drift-kind="setDriftKind"
                @update:selected-field="updateSelectedField"
              />
            </div>
          </div>
        </template>

        <PlaceCollectionManager :collection="filteredCollection" />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed, ref } from 'vue'
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
const dummyPlace = ref<Place | null>(null)
const setDummyPlace = (place: Place) => {
  dummyPlace.value = place
}

const places = computed(() => {
  const list = collection.value ?? []
  const fallback = dummyPlace.value
  if (!fallback) return list
  const hasDummy = list.some((place) => place.id === fallback.id)
  return hasDummy ? list : [fallback, ...list]
})

const placeStoredModel = {
  id: '',
  name: '',
  short_name: '',
  formatted_address: '',
  short_address: '',
  lat: 0,
  lng: 0,
  image_url: '',
  image_shade: 'none',
  source: 'fireux',
  search_term: '',
  claimed_by: '',
  created_at: {},
  updated_at: {},
}

const placeModelRuntime = placeStoredModel

const {
  driftKind,
  setDriftKind,
  selectedField,
  driftById,
  filterOptions,
  filteredCollection,
} = useDevDriftFilter({
  collection: places,
  runtimeModel: placeModelRuntime,
  driftMode: 'all',
})


const filteredDriftPayload = computed(() =>
  filteredCollection.value.map((place) => {
    const drift = driftById.value.get(place.id) ?? { missing: [], extra: [] }
    return {
      id: place.id,
      name: place.name,
      formattedAddress: place.formatted_address,
      drift,
    }
  })
)

const driftCopyPayload = computed(() => ({
  modelPath: 'packages/extensions/fireux-places/src/runtime/models/objects/place.model.ts',
  driftKind: driftKind.value,
  selectedField: selectedField.value || null,
  totalPlaces: filteredCollection.value.length,
  places: filteredDriftPayload.value,
}))

const updateSelectedField = (value: string) => {
  selectedField.value = value
}
</script>
