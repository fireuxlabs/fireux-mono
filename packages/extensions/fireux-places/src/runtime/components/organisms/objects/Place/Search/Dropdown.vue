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
      <UButton
        v-for="cell in visibleCells"
        :key="cell.id"
        color="neutral"
        variant="ghost"
        class="w-full justify-start"
        @click="emit('select', cell)"
      >
        <OrganismsObjectsPlaceCardsCell v-bind="cell" />
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import type { PlaceCard } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'

const SHORTLIST_LIMIT = 4

interface Props {
  cells?: PlaceCard.Cell[] | null
}
const props = withDefaults(defineProps<Props>(), { cells: () => [] })
const { cells } = toRefs(props)

const emit = defineEmits<(e: 'select', cell: PlaceCard.Cell) => void>()
const visibleCells = computed(() =>
  (cells.value ?? []).slice(0, SHORTLIST_LIMIT)
)
</script>

