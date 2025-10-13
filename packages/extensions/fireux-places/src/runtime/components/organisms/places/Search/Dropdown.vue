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
        <UBadge color="primary" variant="soft" size="xs">{{
          visibleCells.length
        }}</UBadge>
      </div>
    </template>

    <ul class="divide-y divide-gray-100 dark:divide-gray-800">
      <li v-for="cell in visibleCells" :key="cell.place_id">
        <UButton
          color="neutral"
          variant="ghost"
          class="w-full justify-start px-4 py-3"
          @click="emit('select', cell)"
        >
          <OrganismsPlacesCell :place="cell" />
        </UButton>
      </li>
    </ul>
  </UCard>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import type { PlaceCard } from '../../../../models/place.model'

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
