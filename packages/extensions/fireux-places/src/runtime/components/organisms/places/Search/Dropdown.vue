<template>
  <UCard v-if="visibleCells.length">
    <ul class="space-y-2">
      <li v-for="cell in visibleCells" :key="cell.place_id">
        <button type="button" class="w-full text-left" @click="onSelect(cell)">
          <OrganismsPlacesCell :place="cell" />
        </button>
      </li>
    </ul>
  </UCard>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import type { PlaceCard } from '../../../../models/place.model'

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
