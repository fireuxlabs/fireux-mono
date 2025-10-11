<template>
  <UCard
    v-if="visibleCells.length"
    class="shadow-sm w-full max-w-md"
    :ui="{ body: 'p-0' }"
  >
    <template #header>
      <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
        <UIcon name="i-lucide-list-tree" />
        <span>Suggestions</span>
        <UBadge color="primary" variant="soft" size="xs">
          {{ visibleCells.length }}
        </UBadge>
      </div>
    </template>

    <ul class="divide-y divide-gray-100 dark:divide-gray-800">
      <li v-for="cell in visibleCells" :key="cell.place_id">
        <UButton
          color="neutral"
          variant="ghost"
          class="w-full justify-start px-4 py-3"
          @click="onSelect(cell)"
        >
          <OrganismsPlacesCell :place="cell" />
        </UButton>
      </li>
    </ul>
  </UCard>
</template>

<script setup lang="ts">
import { computed, toRefs, watch } from 'vue'
import type { PlaceCard } from '../../../../models/place.model'
import { cancelLogoRequests } from '../../../../composables/usePlaceLogos'
import { canonicalPlaceId } from '../../../../composables/usePlacesGoogle'
import { PLACES_SEARCH_SHORTLIST_LIMIT } from '../../../../composables/usePlacesSearch'

interface SearchDropdownProps {
  cells?: PlaceCard.Cell[] | null
}

const props = withDefaults(defineProps<SearchDropdownProps>(), {
  cells: () => [],
})
const { cells } = toRefs(props)
const emit = defineEmits<(event: 'select', cell: PlaceCard.Cell) => void>()

const visibleCells = computed(() =>
  (cells.value ?? []).slice(0, PLACES_SEARCH_SHORTLIST_LIMIT)
)

watch(
  visibleCells,
  (next) => {
    const keep = new Set(next.map((cell) => canonicalPlaceId(cell.place_id)))
    cancelLogoRequests(keep)
  },
  { immediate: true }
)

function onSelect(cell: PlaceCard.Cell) {
  emit('select', cell)
}
</script>
