<template>
  <section
    v-if="services.length || emptyMessage"
    class="space-y-3"
    :class="{
      'rounded-2xl border border-default bg-elevated/30 p-5': !compact,
    }"
    aria-label="Serving times"
  >
    <div
      v-if="!compact"
      class="flex items-center gap-2 text-sm font-semibold text-highlighted"
    >
      <UIcon name="i-lucide-utensils" class="size-4" aria-hidden="true" />
      Serving times
    </div>
    <p v-if="!services.length" class="text-sm text-muted">{{ emptyMessage }}</p>
    <div
      v-for="row in rows"
      :key="row.id"
      class="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm"
    >
      <span class="font-medium text-highlighted">{{ row.name }}</span>
      <span :class="row.open ? 'font-medium text-success' : 'text-muted'">{{
        row.label
      }}</span>
      <span v-if="row.closes" class="text-muted">· Until {{ row.closes }}</span>
    </div>
    <p
      v-if="next && !compact"
      class="border-t border-default pt-3 text-sm text-muted"
    >
      Next service:
      <span class="font-medium text-highlighted">{{ next.name }}</span> ·
      {{ next.next }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { readOpeningHoursStatus } from 'fireux-places/runtime/place/utils/opening-hours-status'
import { useKitchenServiceNow } from '../../composables/useKitchenServiceNow'
import type { KitchenPublicService } from '../../models/public-service.model'
const props = withDefaults(
  defineProps<{
    services: KitchenPublicService[]
    compact?: boolean
    emptyMessage?: string
  }>(),
  { compact: false, emptyMessage: '' }
)
const { now } = useKitchenServiceNow()
const rows = computed(() =>
  props.services.map((service) => {
    const state = readOpeningHoursStatus(
      service.hours,
      service.hours?.timezone,
      now.value
    )
    return {
      ...service,
      ...state,
      open: state.open && !service.paused,
      closes: state.open && !service.paused ? state.closes : '',
      label: service.paused
        ? 'Temporarily paused'
        : !state.known
          ? 'Serving times unavailable'
          : state.open
            ? 'Serving now'
            : state.next
              ? `Starts ${state.next}`
              : 'Not serving now',
    }
  })
)
const next = computed(
  () =>
    rows.value
      .filter((row) => !row.paused && row.nextInMinutes !== null)
      .sort((a, b) => a.nextInMinutes! - b.nextInMinutes!)[0]
)
</script>
