<template>
  <div>
    <UCard>
      <template #header>
        <div class="collection-manager__header">
          <div class="collection-manager__title">
            <h2>Stations</h2>
          </div>

          <UBadge
            v-if="outcome === 'ready' || outcome === 'empty'"
            variant="soft"
            >{{ sortedStations.length }}</UBadge
          >
        </div>
      </template>

      <p v-if="outcome === 'pending'" role="status">Loading stations…</p>
      <div v-else-if="outcome === 'error'" role="alert">
        <p>Stations could not be loaded.</p>
        <FireCopyError message="Stations could not be loaded." />
      </div>
      <div v-else-if="outcome === 'ready'" class="card__media">
        <div v-for="station in sortedStations" :key="station.id">
          <UIcon name="i-lucide-map-pinned" />
          <span>
            {{ stationDisplayName(station) }}
          </span>
        </div>
      </div>

      <p v-else-if="outcome === 'empty'">No stations found.</p>
      <p v-else>Select a kitchen to view stations.</p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenStation } from '../../../../utils/station.ts'
import { useKitchenWorkspaceStations } from '../../../../composables/workspace/stations/useKitchenWorkspaceStations'

const { stations, outcome } = useKitchenWorkspaceStations()
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
