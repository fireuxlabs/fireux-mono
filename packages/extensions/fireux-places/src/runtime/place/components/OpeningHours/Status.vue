<template>
  <ULink
    v-if="place.place_type !== 'non_physical'"
    to="#opening-hours"
    aria-label="Venue opening status and opening hours"
  >
    <UBadge :color="status.open ? 'success' : 'neutral'" variant="soft">
      {{
        !status.known
          ? 'Venue hours unavailable'
          : status.open
            ? status.closes
              ? `Open until ${status.closes.replace(/^today at /, '')}`
              : 'Open now'
            : 'Closed now'
      }}
    </UBadge>
    <span v-if="status.open && status.nextToday">
      · Reopens {{ status.next }}
    </span>
    <span v-else-if="!status.open && status.next">
      · Opens {{ status.next }}
    </span>
    <UIcon name="i-lucide-chevron-down" aria-hidden="true" />
    <p v-if="status.todayHours.length">
      Today: {{ status.todayHours.join(' · ') }}
    </p>
  </ULink>
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
