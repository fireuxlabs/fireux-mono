<template>
  <div class="mt-5" aria-label="Stations preview">
    <template v-if="stations.length">
      <div class="mb-3 flex justify-end">
        <UBadge color="neutral" variant="soft" size="sm">
          {{ stations.length }} stations
        </UBadge>
      </div>

      <div class="grid gap-3 sm:grid-cols-3">
        <UCard
          as="article"
          v-for="station in stations"
          :key="station.id"
          :data-station-id="station.id"
        >
          <div class="flex items-start justify-between gap-3">
            <UIcon name="i-lucide-map-pinned" />
            <UBadge
              :color="station.active ? 'success' : 'neutral'"
              variant="soft"
              size="xs"
            >
              {{ station.active ? 'Active' : 'Inactive' }}
            </UBadge>
          </div>
          <h3 class="mt-3 fx-type-card-heading">
            {{ station.name }}
          </h3>
          <p class="mt-1 fx-type-caption">
            {{ station.description || 'Kitchen work area.' }}
          </p>
        </UCard>
      </div>
    </template>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      :title="error ? 'Stations preview unavailable' : 'No stations configured'"
      :description="
        error
          ? 'The Deanos station records could not be loaded.'
          : 'This Kitchen does not have any work stations yet.'
      "
    />
  </div>
</template>

<script setup lang="ts">
import type { MiseboxProductDemo } from '~/composables/product-demo/useMiseboxProductDemo'

type ProductDemoStation = MiseboxProductDemo['workspace']['stations'][number]

defineProps<{
  error: boolean
  stations: ProductDemoStation[]
}>()
</script>
