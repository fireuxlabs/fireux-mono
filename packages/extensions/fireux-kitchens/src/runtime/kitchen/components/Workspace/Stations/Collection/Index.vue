<template>
  <div class="space-y-6">
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

      <p v-if="outcome === 'pending'" role="status" class="text-sm text-dimmed">
        Loading stations…
      </p>
      <div v-else-if="outcome === 'error'" role="alert">
        <p class="text-sm text-dimmed">Stations could not be loaded.</p>
        <MoleculesCopyError message="Stations could not be loaded." />
      </div>
      <div v-else-if="outcome === 'ready'" class="flex flex-wrap gap-2">
        <div
          v-for="station in sortedStations"
          :key="station.id"
          class="inline-flex items-center gap-2 rounded-full border border-default bg-elevated/30 px-3 py-2"
        >
          <UIcon name="i-lucide-map-pinned" class="size-4 text-dimmed" />
          <span class="text-sm font-semibold text-highlighted">
            {{ stationDisplayName(station) }}
          </span>
        </div>
      </div>

      <p v-else-if="outcome === 'empty'" class="text-sm text-dimmed">
        No stations found.
      </p>
      <p v-else class="text-sm text-dimmed">
        Select a kitchen to view stations.
      </p>
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
