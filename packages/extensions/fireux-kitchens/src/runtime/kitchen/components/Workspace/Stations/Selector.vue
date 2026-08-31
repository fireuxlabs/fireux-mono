<template>
  <section class="flex items-center gap-2" aria-label="Station controls">
    <USelect
      v-if="items.length"
      v-model="selectedStationId"
      :items="items"
      value-key="value"
      aria-label="Select Station"
      class="min-w-0 flex-1 sm:max-w-72"
    />

    <UButton
      icon="i-lucide-plus"
      color="neutral"
      variant="ghost"
      aria-label="Create Station"
      title="Create Station"
      :disabled="!canWrite"
      @click="createStation"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenWorkspaceStations } from '../../../composables/workspace/Stations/useKitchenWorkspaceStations'
import { useKitchenCapabilityTools } from '../../../composables/workspace/useKitchenCapabilityTools'

const { stations, selectedStationId, canWrite } = useKitchenWorkspaceStations()
const { performAction } = useKitchenCapabilityTools('stations')
const items = computed(() =>
  stations.value.map((station) => ({
    label: String(station.name || station.id || 'Untitled Station').trim(),
    value: String(station.id || '').trim(),
  }))
)

function createStation() {
  if (canWrite.value) {
    void performAction('kitchen.stations.create-station')
  }
}
</script>
