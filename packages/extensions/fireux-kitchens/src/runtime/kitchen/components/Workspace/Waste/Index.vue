<template>
  <section class="space-y-3" aria-labelledby="waste-events-title">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h2 id="waste-events-title" class="m-0 text-lg font-semibold">
          Recorded Waste
        </h2>
        <p class="m-0 text-sm text-muted">
          Observed Waste events for the current Kitchen.
        </p>
      </div>
      <UBadge color="neutral" variant="soft">{{ events.length }}</UBadge>
    </div>

    <div v-if="events.length" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <UCard v-for="event in orderedEvents" :key="event.id">
        <div class="grid gap-2">
          <div class="flex items-start justify-between gap-3">
            <h3 class="m-0 font-semibold text-highlighted">
              {{ event.item_name }}
            </h3>
            <UBadge color="neutral" variant="soft">
              {{ event.quantity }} {{ event.unit }}
            </UBadge>
          </div>
          <p class="m-0 text-sm text-muted">
            {{ reasonLabel(event.reason) }} · {{ sourceLabel(event.source) }}
          </p>
          <p v-if="event.notes" class="m-0 text-sm text-dimmed">
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

    <DevDebugPanel
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
} from '../../../utils/waste-event'
import { useKitchenWaste } from '../../../composables/workspace/waste/useKitchenWaste'

const { events, outcome } = useKitchenWaste()
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
