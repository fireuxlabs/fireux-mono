<template>
  <UCard class="place-cell">
    <div class="flex flex-col gap-3">
      <div class="flex items-start gap-3">
        <div class="relative h-16 w-16 flex-shrink-0">
          <img
            v-if="previewSrc"
            :src="previewSrc"
            :alt="place.name"
            class="h-full w-full rounded-lg object-cover"
          />
          <UAvatar v-else :alt="place.name" size="md" icon="i-lucide-map-pin" />
        </div>
        <div class="flex-1 min-w-0 space-y-1">
          <h4 class="text-sm font-medium text-gray-900 truncate">
            {{ place.name }}
          </h4>
          <p
            v-if="place.formatted_address"
            class="text-xs text-gray-500 truncate"
          >
            {{ place.formatted_address }}
          </p>
          <div
            v-if="hasRating"
            class="flex items-center gap-1 text-xs text-gray-500"
          >
            <UIcon name="i-lucide-star" class="text-amber-500" />
            <span>{{ ratingValue?.toFixed(1) }}</span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlaceCard } from 'fireux-places/runtime/models/place.model'

interface CellProps {
  place: PlaceCard.Cell
}

const props = defineProps<CellProps>()

const previewSrc = computed(() => {
  const src = props.place.avatar
  if (!src) return null
  const lower = src.toLowerCase()
  if (lower.includes('mapfiles/place_api/icons')) return null
  return src
})

const ratingValue = computed(() =>
  typeof props.place.rating === 'number' ? props.place.rating : null
)

const hasRating = computed(() => ratingValue.value !== null)
</script>

<style scoped>
.place-cell {
  @apply h-full;
}
</style>
