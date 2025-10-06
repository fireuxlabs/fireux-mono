<template>
  <div class="space-y-4">
    <UInput
      v-model="model"
      icon="i-lucide-search"
      :placeholder="placeholder"
      @input="handleInput"
    />

    <OrganismsPlacesSearchDropdown
      :cells="suggestions"
      @select="handleSelect"
    />

    <OrganismsPlacesSearchSelected
      :place="selectedPlace"
      :place-cell="selectedPlaceCell"
      @clear="handleClear"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import type { Place, PlaceCard } from 'fireux-places/runtime/models/place.model'
import OrganismsPlacesSearchDropdown from './Dropdown.vue'
import OrganismsPlacesSearchSelected from './Selected.vue'

interface PlacesSearchProps {
  modelValue: string
  suggestions: PlaceCard.Cell[]
  selectedPlace: Place | null
  selectedPlaceCell: PlaceCard.Cell | null
  placeholder?: string
}

const props = withDefaults(defineProps<PlacesSearchProps>(), {
  placeholder: 'Start typing a place (min 3 chars)…',
})

const { selectedPlace, selectedPlaceCell } = toRefs(props)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'input'): void
  (event: 'select', cell: PlaceCard.Cell): void
  (event: 'clear'): void
}>()

const model = computed({
  get: () => props.modelValue,
  set: (value: string) => {
    emit('update:modelValue', value)
  },
})

function handleInput() {
  emit('input')
}

function handleSelect(cell: PlaceCard.Cell) {
  emit('select', cell)
}

function handleClear() {
  emit('clear')
}
</script>
