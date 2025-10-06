<template>
  <section class="space-y-2">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-medium text-gray-500">{{ label }}</h3>
      <UBadge v-if="badgeCount" color="neutral" size="xs">{{
        badgeCount
      }}</UBadge>
    </div>

    <UCard>
      <div v-if="loading" class="flex items-center gap-2 text-gray-500 text-sm">
        <UIcon name="i-lucide-loader-circle" class="animate-spin" />
        Loading saved places…
      </div>

      <div v-else-if="showEmpty" class="text-sm text-gray-500">
        <template v-if="queryHasMinLength">
          No saved places match “{{ query }}”. Select a Google suggestion to
          store it locally.
        </template>
        <template v-else>
          No saved places yet. Select a Google result to store it locally.
        </template>
      </div>

      <ul v-else class="space-y-2">
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
import { computed, toRefs } from 'vue'
import type { PlaceCard } from 'fireux-places/runtime/models/place.model'
import OrganismsPlacesCell from './Cell.vue'

interface PlacesListProps {
  label: string
  badgeCount: number
  loading: boolean
  cells: PlaceCard.Cell[]
  query: string
  queryHasMinLength: boolean
}

const props = defineProps<PlacesListProps>()
const { label, badgeCount, loading, cells, query, queryHasMinLength } =
  toRefs(props)
const emit = defineEmits<(event: 'select', cell: PlaceCard.Cell) => void>()

const showEmpty = computed(() => !loading.value && cells.value.length === 0)

function onSelect(cell: PlaceCard.Cell) {
  emit('select', cell)
}
</script>
