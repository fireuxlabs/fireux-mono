<template>
  <p v-if="outcome === 'pending'" role="status">Loading stations…</p>
  <div v-else-if="outcome === 'error'" role="alert">
    <p>Stations could not be loaded.</p>
    <FireCopyError message="Stations could not be loaded." />
  </div>
  <template v-else-if="outcome === 'ready'">
    <p role="status">
      {{ sortedStations.length }}
      {{ sortedStations.length === 1 ? 'station' : 'stations' }}
    </p>
    <ul aria-label="Stations">
      <li v-for="station in sortedStations" :key="station.id">
        <UIcon name="i-lucide-map-pinned" />
        <span>
          {{ stationDisplayName(station) }}
        </span>
      </li>
    </ul>
  </template>

  <p v-else-if="outcome === 'empty'">No stations found.</p>
  <p v-else>Select a kitchen to view stations.</p>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenStation } from '../../../../../utils/station.ts'
import { useKitchenWorkspacePrepStationsRead } from '../../../../../composables/workspace/prep/stations/read'

const { stations, outcome } = useKitchenWorkspacePrepStationsRead()
const normalizeString = (value: unknown) => String(value ?? '').trim()
const stationName = (station: KitchenStation) => normalizeString(station.name)
const stationDisplayName = (station: KitchenStation) =>
  stationName(station) || 'Missing station name'
const sortOrder = (station: KitchenStation) => {
  const value = Number(station.sort_order)
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER
}
const sortedStations = computed(() =>
  [...stations.value].sort((left, right) => {
    const byOrder = sortOrder(left) - sortOrder(right)
    if (byOrder) return byOrder

    return stationDisplayName(left).localeCompare(stationDisplayName(right))
  })
)
</script>
