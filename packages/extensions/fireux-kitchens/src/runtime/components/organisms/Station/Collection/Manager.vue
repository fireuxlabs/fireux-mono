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

    <div v-if="sortedStations.length" class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="station in sortedStations"
        :key="station.id"
        class="rounded-lg border border-default bg-elevated/30 p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 space-y-1">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-map-pinned" class="size-4 text-dimmed" />
              <h3 class="truncate text-sm font-semibold text-highlighted">
                {{ stationDisplayName(station) }}
              </h3>
            </div>

            <UBadge
              v-if="hasMissingName(station)"
              color="error"
              variant="soft"
              size="xs"
            >
              Missing name
            </UBadge>

            <p v-if="stationDescription(station)" class="text-sm text-dimmed">
              {{ stationDescription(station) }}
            </p>
          </div>

          <UBadge
            size="xs"
            variant="soft"
            :color="activeColor(station)"
          >
            {{ activeLabel(station) }}
          </UBadge>
        </div>
      </div>
    </div>

    <p v-else class="text-sm text-dimmed">
      No stations found.
    </p>

    <DevJson
      v-if="isDev"
      title="Stations (JSON)"
      context="collection manager · stations"
      :data="collection"
      :default-open="false"
    />
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenStation } from '../../../../models/kitchen-station.model'

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
const stationDescription = (station: KitchenStation) =>
  normalizeString(station.description)
const hasMissingName = (station: KitchenStation) => !stationName(station)
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
  [...collection.value].sort((left, right) => {
    const byOrder = sortOrder(left) - sortOrder(right)
    if (byOrder) return byOrder

    const byName = stationDisplayName(left).localeCompare(stationDisplayName(right))
    if (byName) return byName

    return normalizeString(left.id).localeCompare(normalizeString(right.id))
  })
)
const isDev = import.meta.dev
</script>
