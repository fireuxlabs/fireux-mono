<template>
  <section v-if="place" class="space-y-2">
    <h3 class="text-sm font-medium text-gray-500">Selected place</h3>
    <UCard>
      <div class="space-y-3">
        <OrganismsPlacesCell v-if="placeCell" :place="placeCell" />

        <div class="grid gap-2 text-xs text-gray-500 md:grid-cols-2">
          <div>
            <span class="font-medium text-gray-600">Latitude:</span>
            <span class="ml-1">{{ formatLatLng(place.lat) }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-600">Longitude:</span>
            <span class="ml-1">{{ formatLatLng(place.lng) }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-600">Website:</span>
            <template v-if="place.website">
              <a
                :href="place.website"
                class="ml-1 text-primary-600 underline"
                target="_blank"
                rel="noopener"
              >
                {{ place.website }}
              </a>
            </template>
            <span v-else class="ml-1 text-gray-400">—</span>
          </div>
          <div>
            <span class="font-medium text-gray-600">Phone:</span>
            <span class="ml-1">{{ place.phone || '—' }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-600">Rating:</span>
            <span class="ml-1">
              <template v-if="typeof place.rating === 'number'">
                {{ place.rating.toFixed(1) }}
                <span v-if="place.user_ratings_total" class="text-gray-400">
                  ({{ place.user_ratings_total }})
                </span>
              </template>
              <template v-else>—</template>
            </span>
          </div>
          <div>
            <span class="font-medium text-gray-600">Avatar:</span>
            <template v-if="place.avatar">
              <a
                :href="place.avatar"
                class="ml-1 text-primary-600 underline"
                target="_blank"
                rel="noopener"
              >
                {{ place.avatar }}
              </a>
            </template>
            <span v-else class="ml-1 text-gray-400">—</span>
          </div>
        </div>

        <div class="flex gap-2">
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            @click="emit('clear')"
          >
            <UIcon name="i-lucide-x" class="mr-1" /> Clear
          </UButton>
        </div>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { toRefs } from 'vue'
import type { Place, PlaceCard } from 'fireux-places/runtime/models/place.model'
import OrganismsPlacesCell from '../Cell.vue'

interface SelectedDetailsProps {
  place: Place | null
  placeCell: PlaceCard.Cell | null
}

const props = defineProps<SelectedDetailsProps>()
const emit = defineEmits<(event: 'clear') => void>()
const { place, placeCell } = toRefs(props)

function formatLatLng(value?: number | null) {
  if (typeof value !== 'number') return '—'
  return Number(value).toFixed(6)
}
</script>
