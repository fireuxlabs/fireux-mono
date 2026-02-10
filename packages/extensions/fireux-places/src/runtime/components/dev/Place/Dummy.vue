<template>
  <UCard>
    <template #header>
      <div class="flex items-start justify-between gap-3">
        <div class="space-y-2">
          <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Dummy place surfaces
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Preview Pill, Cell, Preview, and Profile surfaces using a rich dummy place.
          </p>
        </div>
      </div>
    </template>

    <div class="flex flex-wrap gap-2">
      <PlaceCardsPill
        v-for="item in pillItems"
        :key="item.placeId"
        v-bind="item.card"
        action
        @action="selectPlace(item.place)"
      />
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Pill</div>
        <PlaceCardsPill
          v-if="dummyPill"
          v-bind="dummyPill"
        />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Cell</div>
        <PlaceCardsCell
          v-if="dummyCell"
          v-bind="dummyCell"
        />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Preview</div>
        <PlaceCardsPreview
          v-if="dummyPreview"
          v-bind="dummyPreview"
        />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Profile</div>
        <PlaceCardsProfile
          v-if="dummyProfile"
          :model="dummyProfile"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { dummyPlaceDocDataList, dummyPlaceGoogleData } from '../../../../../../../../dummy/place.dummy'
import { usePlacesInterface } from '../../../composables/fireux/firestore/place/utils/view/usePlacesInterface'
import type { Place } from '../../../models/objects/place.model'
import { Place as PlaceModelRuntime } from '../../../models/objects/place.model'

const emit = defineEmits<{
  (event: 'ready', place: Place): void
}>()

const { pill, cell, preview, profile } = usePlacesInterface()

const dummyPlaceList = dummyPlaceDocDataList as Partial<Place>[]

const selectedId = ref(String(dummyPlaceList[0]?.id ?? ''))

const buildStoredPlace = (place: Partial<Place>): Place => ({
  ...PlaceModelRuntime,
  ...place,
})

const selectedPlaceDoc = computed(() =>
  dummyPlaceList.find((place) => String(place.id) === selectedId.value)
)

const dummyPlaceDoc = computed(() => selectedPlaceDoc.value ?? dummyPlaceList[0])
const dummyPlaceGoogle = dummyPlaceGoogleData as Partial<Place>

const dummyPlaceStored = computed(() => buildStoredPlace(dummyPlaceDoc.value ?? {}))

const dummyPlaceHydrated = computed<Place>(() => ({
  ...dummyPlaceStored.value,
  ...dummyPlaceGoogle,
}))

const pillItems = computed(() =>
  dummyPlaceList
    .map((place) => {
      const stored = buildStoredPlace(place)
      const card = pill(stored)
      return {
        place,
        placeId: String(place.id ?? ''),
        card,
      }
    })
    .filter((item) => Boolean(item.card))
)

const dummyPill = computed(() => pill(dummyPlaceStored.value))
const dummyCell = computed(() => cell(dummyPlaceStored.value))
const dummyPreview = computed(() => preview(dummyPlaceStored.value))
const dummyProfile = computed(() => profile(dummyPlaceHydrated.value))

const selectPlace = (place: Partial<Place>) => {
  selectedId.value = String(place.id)
}

onMounted(() => {
  emit('ready', dummyPlaceStored.value)
})

watch(dummyPlaceStored, (next) => {
  emit('ready', next)
})
</script>
