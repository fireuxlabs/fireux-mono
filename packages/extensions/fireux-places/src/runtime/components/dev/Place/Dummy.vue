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
import { computed, onMounted } from 'vue';
import { dummyPlaceDocData, dummyPlaceGoogleData } from '../../../../../../../../dummy/place.dummy';
import { usePlacesInterface } from '../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface';
import type { Place } from '../../../models/objects/place.model';
import { Place as PlaceModelRuntime } from '../../../models/objects/place.model';

const emit = defineEmits<{
  (event: 'ready', place: Place): void
}>()

const { pill, cell, preview, profile } = usePlacesInterface()

const dummyPlaceDoc = dummyPlaceDocData as Partial<Place>
const dummyPlaceGoogle = dummyPlaceGoogleData as Partial<Place>

const dummyPlaceStored: Place = {
  ...PlaceModelRuntime,
  ...dummyPlaceDoc,
}

const dummyPlaceHydrated: Place = {
  ...dummyPlaceStored,
  ...dummyPlaceGoogle,
}

const dummyPill = computed(() => pill(dummyPlaceStored))
const dummyCell = computed(() => cell(dummyPlaceStored))
const dummyPreview = computed(() => preview(dummyPlaceStored))
const dummyProfile = computed(() => profile(dummyPlaceHydrated))

onMounted(() => {
  emit('ready', dummyPlaceStored)
})
</script>
