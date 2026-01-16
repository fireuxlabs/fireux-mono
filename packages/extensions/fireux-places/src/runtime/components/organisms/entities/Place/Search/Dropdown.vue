<template>
  <UCard
    v-if="visibleCells.length"
    class="w-full"
    :ui="{ body: 'p-0' }"
  >
    <template #header>
      <div class="flex items-center gap-2 text-sm font-medium">
        <UIcon name="i-lucide-list-tree" />
        <span>Suggestions</span>
        <UBadge color="primary" variant="soft" size="xs">{{
          visibleCells.length
        }}</UBadge>
      </div>
    </template>

    <div class="space-y-1 p-2">
      <component
        :is="wrapperFor(cell)"
        v-for="cell in visibleCells"
        :key="cell.id"
        v-bind="wrapperPropsFor(cell)"
        class="block w-full text-left rounded-[16px] ring-1 ring-transparent transition hover:bg-neutral-100/80 dark:hover:bg-neutral-900/70"
      >
        <PlaceCardsCell v-bind="cell" :show-source="true" />
      </component>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';
import type { PlaceCard } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface';

const SHORTLIST_LIMIT = 4

interface Props {
  cells?: PlaceCard.Card[] | null
}
const props = withDefaults(defineProps<Props>(), { cells: () => [] })
const { cells } = toRefs(props)

const emit = defineEmits<{ (e: 'select', cell: PlaceCard.Card): void }>()
const visibleCells = computed(() =>
  (cells.value ?? []).slice(0, SHORTLIST_LIMIT)
)

const wrapperFor = (_cell: PlaceCard.Card) => 'button'

const wrapperPropsFor = (cell: PlaceCard.Card) => ({
  type: 'button',
  onClick: () => emit('select', cell),
})
</script>

