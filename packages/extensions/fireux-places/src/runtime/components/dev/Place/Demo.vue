<template>
  <UCard>
    <template #header>
      <div class="flex items-start justify-between gap-3">
        <div class="space-y-2">
          <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Demo place surfaces
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Preview Pill, Cell, Preview, and Profile surfaces using a rich demo place.
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
          v-if="demoPill"
          v-bind="demoPill"
        />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Cell</div>
        <PlaceCardsCell
          v-if="demoCell"
          v-bind="demoCell"
        />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Preview</div>
        <PlaceCardsPreview
          v-if="demoPreview"
          v-bind="demoPreview"
        />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Profile</div>
        <PlaceCardsProfile
          v-if="demoProfile"
          :model="demoProfile"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { demoPlaceDocDataList, demoPlaceGoogleData } from '../../../../../../../../demo/place.demo'
import { usePlaceInterface } from '../../../composables/fireux/firestore/place/utils/view/usePlaceInterface'
import type { Place } from '../../../models/place.model'
import { PlaceModel as PlaceModelRuntime } from '../../../models/place.model'

const emit = defineEmits<{
  (event: 'ready', place: Place): void
}>()

const { pill, cell, preview, profile } = usePlaceInterface()

const demoPlaceList = demoPlaceDocDataList as Partial<Place>[]

const selectedId = ref(String(demoPlaceList[0]?.id ?? ''))

const buildStoredPlace = (place: Partial<Place>): Place => ({
  ...PlaceModelRuntime,
  ...place,
})

const selectedPlaceDoc = computed(() =>
  demoPlaceList.find((place) => String(place.id) === selectedId.value)
)

const demoPlaceDoc = computed(() => selectedPlaceDoc.value ?? demoPlaceList[0])
const demoPlaceGoogle = demoPlaceGoogleData as Partial<Place>

const demoPlaceStored = computed(() => buildStoredPlace(demoPlaceDoc.value ?? {}))

const demoPlaceHydrated = computed<Place>(() => ({
  ...demoPlaceStored.value,
  ...demoPlaceGoogle,
}))

const pillItems = computed(() =>
  demoPlaceList
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

const demoPill = computed(() => pill(demoPlaceStored.value))
const demoCell = computed(() => cell(demoPlaceStored.value))
const demoPreview = computed(() => preview(demoPlaceStored.value))
const demoProfile = computed(() => profile(demoPlaceHydrated.value))

const selectPlace = (place: Partial<Place>) => {
  selectedId.value = String(place.id)
}

onMounted(() => {
  emit('ready', demoPlaceStored.value)
})

watch(demoPlaceStored, (next: Place) => {
  emit('ready', next)
})
</script>
