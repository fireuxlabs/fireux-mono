<template>
  <section v-if="visibleCells.length" class="space-y-2">
    <h3 class="text-sm font-medium text-gray-500">Search results</h3>
    <UCard>
      <ul class="space-y-2">
        <li v-for="cell in visibleCells" :key="cell.place_id">
          <button
            type="button"
            class="w-full text-left"
            @click="onSelect(cell)"
          >
            <OrganismsPlacesCell :place="cell" />
          </button>
        </li>
      </ul>
    </UCard>
  </section>
</template>
<script setup lang="ts">
import { computed, toRefs } from 'vue'
import type { PlaceCard } from 'fireux-places/runtime/models/place.model'
import OrganismsPlacesCell from '../Cell.vue'

interface SearchDropdownProps {
  cells?: PlaceCard.Cell[] | null
}

const props = withDefaults(defineProps<SearchDropdownProps>(), {
  cells: () => [],
})
const { cells } = toRefs(props)
const emit = defineEmits<(event: 'select', cell: PlaceCard.Cell) => void>()

const visibleCells = computed(() => cells.value ?? [])

function onSelect(cell: PlaceCard.Cell) {
  emit('select', cell)
}
</script>
