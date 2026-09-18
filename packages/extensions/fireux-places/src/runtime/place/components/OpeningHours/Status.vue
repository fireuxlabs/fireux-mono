<template>
  <a
    v-if="place.place_type !== 'non_physical'"
    href="#opening-hours"
    class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm no-underline"
    aria-label="Venue opening status and opening hours"
  >
    <span
      class="inline-flex items-center gap-2 font-semibold"
      :class="status.open ? 'text-success' : 'text-highlighted'"
    >
      <span
        class="size-2 rounded-full"
        :class="status.open ? 'bg-success' : 'bg-dimmed'"
        aria-hidden="true"
      />
      {{
        !status.known
          ? 'Venue hours unavailable'
          : status.open
            ? 'Venue open now'
            : 'Venue closed'
      }}
    </span>
    <span class="text-muted">{{
      status.open && status.closes
        ? `Closes ${status.closes}`
        : status.next
          ? `Opens ${status.next}`
          : 'See opening hours'
    }}</span>
    <UIcon
      name="i-lucide-chevron-down"
      class="size-3.5 text-muted"
      aria-hidden="true"
    />
  </a>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useState } from '#imports'
import type { Place } from '../../models/place.model'
import { readOpeningHoursStatus } from '../../utils/opening-hours-status'
const props = defineProps<{ place: Partial<Place> }>()
const now = useState('place-opening-status-now', () => Date.now())
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  now.value = Date.now()
  timer = setInterval(() => {
    now.value = Date.now()
  }, 30000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
const status = computed(() =>
  readOpeningHoursStatus(
    props.place.business_hours,
    props.place.timezone,
    new Date(now.value)
  )
)
</script>
