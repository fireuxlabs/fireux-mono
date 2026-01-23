<template>
  <div v-if="cells.length" class="space-y-1">
    <button
      v-for="cell in cells"
      :key="cell.id"
      type="button"
      class="block w-full text-left rounded-[16px] ring-1 ring-transparent transition hover:bg-neutral-100/80 dark:hover:bg-neutral-900/70"
      @click="emit('select', cell)"
    >
      <PlaceCardsCell v-bind="cell" :show-source="true" />
    </button>
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

