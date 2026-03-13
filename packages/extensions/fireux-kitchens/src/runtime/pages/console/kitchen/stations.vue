<template>
  <UDashboardPanel id="console-kitchen-stations">
    <template #header>
      <LayoutsConsoleNavbar title="Stations" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          Mode: <span class="font-medium">{{ mode }}</span> · Stations:
          <span class="font-medium">{{ stations.length }}</span>
        </div>

        <UCard v-if="stations.length">
          <div class="space-y-2">
            <div
              v-for="station in stations"
              :key="station.id || station.key"
              class="rounded border border-default p-3"
            >
              <div class="font-medium">
                {{ station.name || station.id || 'Untitled station' }}
              </div>
              <div class="text-xs text-dimmed">
                {{ station.key || 'no-key' }}
                <template v-if="station.description"> · {{ station.description }}</template>
              </div>
            </div>
          </div>
        </UCard>

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          title="No stations loaded"
          description="No station data yet for this kitchen context."
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeKitchen } from '../../../composables/fireux/app/kitchen-runtime/useRuntimeKitchen'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-stations',
    label: 'Stations',
    icon: 'i-lucide-layout-grid',
    order: 7,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeKitchen()
const mode = runtime.mode
const stations = computed(() =>
  (runtime.data.value.stations ?? []).map((station: any, index: number) => ({
    id: String(station?.id || '').trim() || `station-${index + 1}`,
    key: String(station?.key || '').trim(),
    name: String(station?.name || station?.label || '').trim(),
    description: String(station?.description || '').trim(),
  }))
)
</script>
