<template>
  <UCard>
    <template #header>
      <div>
        <div class="text-base font-semibold text-highlighted">Place record</div>
        <p class="text-sm text-dimmed">
          Route and provider facts are shown here but are not editable yet.
        </p>
      </div>
    </template>

    <dl class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="fact in facts" :key="fact.label" class="space-y-1">
        <dt class="text-xs font-medium uppercase tracking-wide text-dimmed">
          {{ fact.label }}
        </dt>
        <dd class="text-sm font-medium text-highlighted">{{ fact.value }}</dd>
      </div>
    </dl>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Place } from '../../../models/place.model'

const props = defineProps<{ place: Place }>()
const facts = computed(() => [
  { label: 'Route slug', value: props.place.slug || 'Not set' },
  {
    label: 'Place type',
    value: props.place.place_type === 'non_physical' ? 'Non-physical' : 'Physical',
  },
  {
    label: 'Source',
    value: props.place.source === 'google'
      ? 'Google provider'
      : props.place.source === 'manual'
        ? 'Manual'
        : 'FireUX',
  },
  { label: 'Verification', value: props.place.verified ? 'Verified' : 'Unverified' },
])
</script>
