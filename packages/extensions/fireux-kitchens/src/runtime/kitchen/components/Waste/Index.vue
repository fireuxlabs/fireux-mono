<template>
  <section class="space-y-3" aria-labelledby="waste-events-title">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h2 id="waste-events-title">Recorded Waste</h2>
        <p>Observed Waste events for the current Kitchen.</p>
      </div>
      <UBadge color="neutral" variant="soft">{{ events.length }}</UBadge>
    </div>

    <div v-if="events.length" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <UCard v-for="event in orderedEvents" :key="event.id">
        <div class="fx-card-body-stack">
          <div class="card__header">
            <h3>
              {{ event.item_name }}
            </h3>
            <UBadge color="neutral" variant="soft">
              {{ event.quantity }} {{ event.unit }}
            </UBadge>
          </div>
          <p>
            {{ reasonLabel(event.reason) }} · {{ sourceLabel(event.source) }}
          </p>
          <p v-if="event.notes">
            {{ event.notes }}
          </p>
        </div>
      </UCard>
    </div>

    <UAlert
      v-else-if="outcome === 'empty'"
      color="neutral"
      variant="soft"
      title="No Waste recorded"
      description="Use Record Waste when something is spoiled, lost during preparation, overproduced, or returned."
    />
    <UAlert
      v-else-if="outcome === 'error'"
      color="error"
      variant="soft"
      title="Waste could not be loaded"
    />

    <FireDiagnosticsDebugPanel
      title="Kitchen Waste events"
      scope="workspace"
      object-origin="fetched"
      :objects="{ events }"
      :derived="{ outcome }"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  KITCHEN_WASTE_REASON_OPTIONS,
  KITCHEN_WASTE_SOURCE_OPTIONS,
  type KitchenWasteEvent,
} from '../../utils/waste-event'
import { useKitchenWorkspaceWaste } from '../../composables/workspace/waste/useKitchenWorkspaceWaste'

const { events, outcome } = useKitchenWorkspaceWaste()
const timestampMillis = (event: KitchenWasteEvent) => {
  const value = event.occurred_at as unknown as { toMillis?: () => number }
  return typeof value?.toMillis === 'function' ? value.toMillis() : 0
}
const orderedEvents = computed(() =>
  [...events.value].sort(
    (left, right) => timestampMillis(right) - timestampMillis(left)
  )
)
const reasonLabel = (value: string) =>
  KITCHEN_WASTE_REASON_OPTIONS.find((option) => option.value === value)
    ?.label || 'Other'
const sourceLabel = (value: string) =>
  KITCHEN_WASTE_SOURCE_OPTIONS.find((option) => option.value === value)
    ?.label || 'Other'
</script>
