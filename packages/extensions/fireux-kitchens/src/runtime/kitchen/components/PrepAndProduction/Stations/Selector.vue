<template>
  <section aria-label="Station controls">
    <USelect
      v-if="items.length"
      v-model="selectedStationId"
      :items="items"
      value-key="value"
      aria-label="Select Station"
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
import { useKitchenWorkspaceStations } from '../../../composables/workspace/stations/useKitchenWorkspaceStations'

const { stations, selectedStationId, canWrite, createOpen } =
  useKitchenWorkspaceStations()
const items = computed(() =>
  stations.value.map((station) => ({
    label: String(station.name || station.id || 'Untitled Station').trim(),
    value: String(station.id || '').trim(),
  }))
)

function createStation() {
  if (canWrite.value) {
    createOpen.value = true
  }
}
</script>
