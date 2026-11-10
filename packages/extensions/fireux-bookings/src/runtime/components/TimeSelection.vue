<template>
  <fieldset class="booking-times">
    <legend>Available times</legend>
    <p v-if="!slots.length" role="status">No times are available.</p>
    <label v-for="slot in slots" :key="slot.id" class="booking-times__choice">
      <input
        type="radio"
        :name="groupName"
        :value="slot.id"
        :checked="selected === slot.id"
        @change="$emit('select', slot.id)"
      />
      <BookingPeriod :start-at="slot.startAt" :end-at="slot.endAt" />
    </label>
  </fieldset>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import BookingPeriod from './Period.vue'
import type { BookingSlot } from '../types/booking-surface'

defineProps<{ slots: BookingSlot[]; selected: string }>()
defineEmits<{ select: [id: string] }>()
const groupName = useId()
</script>

<style scoped>
.booking-times {
  display: grid;
  gap: calc(var(--spacing) * 3);
  border: 0;
  padding: 0;
  margin: 0;
}
.booking-times legend {
  margin-bottom: calc(var(--spacing) * 3);
}
.booking-times__choice {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 4);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  cursor: pointer;
}
.booking-times__choice:has(input:checked) {
  border-color: var(--ui-primary);
  background: var(--ui-bg-elevated);
}
.booking-times__choice:focus-within {
  outline: 2px solid var(--ui-primary);
  outline-offset: 2px;
}
</style>
