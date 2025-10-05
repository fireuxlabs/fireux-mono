<template>
  <UCard class="place-cell">
    <div class="flex flex-col gap-3">
      <div class="flex items-start gap-3">
        <UAvatar
          :src="avatarSrc || undefined"
          :alt="place.name"
          size="md"
          icon="i-lucide-map-pin"
        />
        <div class="flex-1 min-w-0 space-y-1">
          <div class="flex items-center gap-2">
            <h4 class="text-sm font-medium text-gray-900 truncate">
              {{ place.name }}
            </h4>
            <UBadge v-if="badgeLabel" :color="badgeColor" size="xs">
              {{ badgeLabel }}
            </UBadge>
          </div>
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

const badgeLabel = computed(() => props.place.meta_right ?? null)

const badgeColor = computed(() => {
  const label = badgeLabel.value?.toLowerCase()
  if (label === 'saved') return 'green'
  if (label === 'google') return 'blue'
  return 'gray'
})

const avatarSrc = computed(() => props.place.avatar ?? null)

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
