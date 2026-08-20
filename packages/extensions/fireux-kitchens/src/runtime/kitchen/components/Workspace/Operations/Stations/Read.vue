<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="collection-manager__header">
          <div class="collection-manager__title">
            <h2>Stations</h2>
            <p>Kitchen work areas for the selected kitchen.</p>
          </div>

          <UBadge variant="soft">{{ sortedStations.length }}</UBadge>
        </div>
      </template>

      <div v-if="sortedStations.length" class="flex flex-wrap gap-2">
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

      <p v-else class="text-sm text-dimmed">
        No stations found.
      </p>
    </UCard>

    <DevDebugPanel
      title="Kitchen stations"
      scope="workspace"
      object-origin="fetched"
      :objects="{ stations }"
      :derived="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenStation } from '../../../../models/station.model.ts'
import { useKitchenWorkspaceStations } from '../../../../composables/workspace/operations/Stations/useKitchenWorkspaceStations'

const { stations, debug } = useKitchenWorkspaceStations()
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
