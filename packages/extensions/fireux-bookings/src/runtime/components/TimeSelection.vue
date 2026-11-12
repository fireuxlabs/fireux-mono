<template>
  <UAlert
    v-if="!slots.length"
    color="neutral"
    variant="soft"
    icon="i-lucide-calendar-x"
    title="No times available"
    description="Available times will appear here."
  />
  <URadioGroup
    v-else
    legend="Available times"
    :items="items"
    :model-value="selected"
    variant="card"
    size="lg"
    @update:model-value="select"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BookingSlot } from '../types/booking-surface'
const props = defineProps<{ slots: BookingSlot[]; selected: string }>()
const emit = defineEmits<{ select: [id: string] }>()
const items = computed(() =>
  props.slots.map((slot) => ({
    value: slot.id,
    label: slot.startAt.slice(11) + ' – ' + slot.endAt.slice(11),
    description:
      slot.startAt.slice(0, 10) === slot.endAt.slice(0, 10)
        ? slot.startAt.slice(0, 10)
        : slot.startAt.slice(0, 10) + ' → ' + slot.endAt.slice(0, 10),
  }))
)
function select(value: unknown) {
  if (typeof value === 'string') emit('select', value)
}
</script>
