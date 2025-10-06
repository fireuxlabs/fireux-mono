<template>
  <section v-if="cells.length" class="space-y-2">
    <h3 class="text-sm font-medium text-gray-500">Search results</h3>
    <UCard>
      <ul class="space-y-2">
        <li v-for="cell in cells" :key="cell.id">
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
import { toRefs } from 'vue'
import type { PlaceCard } from 'fireux-places/runtime/models/place.model'
import OrganismsPlacesCell from '../Cell.vue'

interface SearchDropdownProps {
  cells: PlaceCard.Cell[]
}

const props = defineProps<SearchDropdownProps>()
const { cells } = toRefs(props)
const emit = defineEmits<(event: 'select', cell: PlaceCard.Cell) => void>()

function onSelect(cell: PlaceCard.Cell) {
  emit('select', cell)
}
</script>
