<template>
  <UPage>
    <UPageHeader
      title="Dev · Places (Ext)"
      description="Collection-first view; filter by missing or extra fields (against the runtime Place model)."
    />

    <UPageBody class="space-y-10">
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
                :copy-label="copying ? 'Copying…' : 'Copy drift · Places'"
                :copy-icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
                :copy-disabled="copying"
                @update:drift-kind="setDriftKind"
                @update:selected-field="updateSelectedField"
                @copy="copyDrift"
              />
            </div>
          </div>
        </template>

        <template #footer>
          <DevJson
            :title="'Places (JSON)'"
            :data="allJsonPayload"
            :default-open="false"
          />
        </template>

        <PlaceCollectionManager
          :cards="placeCards"
          :total="totalPlaces"
        />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useDevClipboard } from 'fireux-core/runtime/composables/dev/useDevClipboard'
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { usePlaces } from '../../composables/fireux/firestore/objects/place/usePlaces'
import { usePlacesInterface } from '../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'
import type { Place } from '../../models/objects/place.model'
import { Place as PlaceModelRuntime } from '../../models/objects/place.model'

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

const placeModelRuntime = PlaceModelRuntime

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
})

const { card: makeCard } = usePlacesInterface()
const placeCards = computed(() =>
  filteredCollection.value
    .map((place) => makeCard(place))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const totalPlaces = computed(() => placeCards.value.length)

const allJsonPayload = computed(() => ({
  totalPlaces: places.value.length,
  places: places.value,
}))

const filteredDriftPayload = computed(() =>
  placeCards.value.map((card) => {
    const drift = driftById.value.get(card.id) ?? { missing: [], extra: [] }
    return {
      id: card.id,
      name: card.name,
      formattedAddress: card.formattedAddress,
      drift,
    }
  })
)

const { copyJSON, copying } = useDevClipboard()

const copyDrift = async () => {
  await copyJSON(
    {
      modelPath: 'packages/extensions/fireux-places/src/runtime/models/objects/place.model.ts',
      driftKind: driftKind.value,
      selectedField: selectedField.value || null,
      totalPlaces: totalPlaces.value,
      places: filteredDriftPayload.value,
    },
    { label: 'Dev · Places (Ext) · Filtered drift' }
  )
}

const updateSelectedField = (value: string) => {
  selectedField.value = value
}
</script>
