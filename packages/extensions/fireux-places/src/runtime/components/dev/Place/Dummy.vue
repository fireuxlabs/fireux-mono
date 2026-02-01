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
import { usePlacesInterface } from '../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface';
import type { Place } from '../../../models/objects/place.model';
import { Place as PlaceModelRuntime } from '../../../models/objects/place.model';

const emit = defineEmits<{
  (event: 'ready', place: Place): void
}>()

const { pill, cell, preview, profile } = usePlacesInterface()

const dummyPlaceDocData: Partial<Place> = {
  id: 'dev-place-misebox-001',
  name: 'Maison Lumen',
  short_name: 'Lumen',
  formatted_address: '12 Rue des Lilas, 75010 Paris, France',
  short_address: 'Rue des Lilas, Paris',
  lat: 48.8723,
  lng: 2.3651,
  image_url:
    'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=240&h=240&auto=format&fit=crop',
  image_shade: 'light',
  source: 'fireux',
  search_term: 'Maison Lumen Paris',
}

const dummyPlaceGoogleData: Partial<Place> = {
  about:
    'A sunlit neighborhood café and patisserie focused on seasonal bakes, slow coffee, and small plates. Designed for long mornings, quick lunches, and golden-hour meetups.',
  phone: '+33 1 45 67 89 10',
  website: 'https://maisonlumen.fr',
  google_maps_url: 'https://maps.google.com/?q=Maison%20Lumen%20Paris',
  types: ['cafe', 'bakery', 'restaurant'],
  rating: 4.7,
  rating_count: 1280,
  price_level: 'mid',
  hours_text: [
    'Mon–Fri 08:00–19:00',
    'Sat 09:00–20:00',
    'Sun 09:00–17:00',
  ],
}

const dummyPlaceStored: Place = {
  ...PlaceModelRuntime,
  ...dummyPlaceDocData,
}

const dummyPlaceHydrated: Place = {
  ...dummyPlaceStored,
  ...dummyPlaceGoogleData,
}

const dummyPill = computed(() => pill(dummyPlaceStored))
const dummyCell = computed(() => cell(dummyPlaceStored))
const dummyPreview = computed(() => preview(dummyPlaceStored))
const dummyProfile = computed(() => profile(dummyPlaceHydrated))

onMounted(() => {
  emit('ready', dummyPlaceStored)
})
</script>
