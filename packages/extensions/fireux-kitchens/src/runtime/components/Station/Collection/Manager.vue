<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
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
        <UBadge
          v-if="hasMissingName(station)"
          color="error"
          variant="soft"
          size="xs"
        >
          Missing name
        </UBadge>
      </div>
    </div>

    <p v-else class="text-sm text-dimmed">
      No stations found.
    </p>

    <DevJson
      title="Stations (JSON)"
      context="collection manager · stations"
      :data="collection"
      :default-open="false"
    />
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenStation } from '../../../models/kitchen-station.model'

const props = withDefaults(
  defineProps<{
    collection?: KitchenStation[]
    title?: string
    description?: string
  }>(),
  {
    title: 'Stations',
    description: 'Kitchen work areas for this kitchen.',
  }
)

const normalizeString = (value: unknown) => String(value ?? '').trim()
const collection = computed(() => props.collection ?? [])
const stationName = (station: KitchenStation) => normalizeString(station.name)
const stationDisplayName = (station: KitchenStation) =>
  stationName(station) || 'Missing station name'
const hasMissingName = (station: KitchenStation) => !stationName(station)
const sortOrder = (station: KitchenStation) => {
  const value = Number(station.sort_order)
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER
}
const sortedStations = computed(() =>
  [...collection.value].sort((left, right) => {
    const byOrder = sortOrder(left) - sortOrder(right)
    if (byOrder) return byOrder

    const byName = stationDisplayName(left).localeCompare(stationDisplayName(right))
    if (byName) return byName

    return normalizeString(left.id).localeCompare(normalizeString(right.id))
  })
)
</script>
