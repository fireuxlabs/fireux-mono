<template>
  <div v-if="cells.length" class="space-y-1">
    <PlaceCardsDropdownItem
      v-for="cell in cells"
      :key="cell.id"
      v-bind="cell"
      :show-source="true"
      @select="emit('select', cell)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PlaceCard } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface';

const props = withDefaults(
  defineProps<{
    cells?: PlaceCard.Card[] | null
  }>(),
  { cells: () => [] }
)

const emit = defineEmits<{
  (e: 'select', cell: PlaceCard.Card): void
}>()

const cells = computed(() => (props.cells ?? []) as PlaceCard.Card[])
</script>

