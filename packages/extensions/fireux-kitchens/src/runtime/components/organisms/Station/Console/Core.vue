<template>
  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">Station overview</div>
        <p class="console-card-header__description">
          Read-only view of where kitchen work happens.
        </p>
      </div>
    </template>

    <div v-if="sortedStations.length" class="space-y-2">
      <div
        v-for="station in sortedStations"
        :key="station.id"
        class="flex items-center justify-between gap-3 rounded-lg border border-default px-3 py-2"
      >
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-highlighted">
            {{ stationDisplayName(station) }}
          </p>
          <p v-if="stationDescription(station)" class="truncate text-xs text-dimmed">
            {{ stationDescription(station) }}
          </p>
        </div>

        <UBadge size="xs" variant="soft" :color="activeColor(station)">
          {{ activeLabel(station) }}
        </UBadge>
      </div>
    </div>

    <p v-else class="text-sm text-dimmed">
      No station overview available.
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenStation } from '../../../../models/kitchen-station.model'

const props = withDefaults(
  defineProps<{
    collection?: KitchenStation[]
  }>(),
  {
    collection: () => [],
  }
)

const normalizeString = (value: unknown) => String(value ?? '').trim()
const stationName = (station: KitchenStation) => normalizeString(station.name)
const stationDisplayName = (station: KitchenStation) =>
  stationName(station) || 'Missing station name'
const stationDescription = (station: KitchenStation) =>
  normalizeString(station.description)
const activeValue = (station: KitchenStation) =>
  (station as Record<string, unknown>).active
const activeLabel = (station: KitchenStation) => {
  const value = activeValue(station)
  if (value === true) return 'Active'
  if (value === false) return 'Inactive'
  return 'Missing active state'
}
const activeColor = (station: KitchenStation) => {
  const value = activeValue(station)
  if (value === true) return 'primary'
  if (value === false) return 'neutral'
  return 'error'
}
const sortOrder = (station: KitchenStation) => {
  const value = Number(station.sort_order)
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER
}
const sortedStations = computed(() =>
  [...props.collection].sort((left, right) => {
    const byOrder = sortOrder(left) - sortOrder(right)
    if (byOrder) return byOrder

    const byName = stationDisplayName(left).localeCompare(stationDisplayName(right))
    if (byName) return byName

    return normalizeString(left.id).localeCompare(normalizeString(right.id))
  })
)
</script>
