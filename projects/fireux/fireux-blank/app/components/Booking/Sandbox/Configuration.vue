<template>
  <div class="booking-configuration">
    <UFormField label="Booking title" name="bookingTitle">
      <UInput
        :model-value="modelValue.title"
        maxlength="100"
        placeholder="Enter a booking title"
        @update:model-value="updateTitle"
      />
    </UFormField>
    <fieldset
      v-for="(slot, index) in modelValue.slots"
      :key="slot.id"
      class="booking-configuration__slot"
    >
      <legend>Time {{ index + 1 }}</legend>
      <UFormField label="Start date and time" :name="`start-${slot.id}`">
        <UInput
          :model-value="slot.startAt"
          type="datetime-local"
          @update:model-value="updateTime(slot.id, 'startAt', $event)"
        />
      </UFormField>
      <UFormField label="End date and time" :name="`end-${slot.id}`">
        <UInput
          :model-value="slot.endAt"
          type="datetime-local"
          @update:model-value="updateTime(slot.id, 'endAt', $event)"
        />
      </UFormField>
      <p
        v-if="slot.startAt && slot.endAt && !isValidBookingSlot(slot)"
        role="status"
      >
        Enter a valid period with the end after the start.
      </p>
      <UButton
        color="neutral"
        variant="ghost"
        :aria-label="`Remove time ${index + 1}`"
        @click="remove(slot.id)"
        >Remove time</UButton
      >
    </fieldset>
    <UButton color="neutral" variant="outline" @click="add">Add time</UButton>
  </div>
</template>

<script setup lang="ts">
import type {
  BookingConfiguration,
  BookingSlot,
} from 'fireux-bookings/runtime/types/booking-surface'
import { isValidBookingSlot } from 'fireux-bookings/runtime/utils/booking-slot'
const props = defineProps<{ modelValue: BookingConfiguration }>()
const emit = defineEmits<{
  'update:modelValue': [configuration: BookingConfiguration]
}>()
function updateTitle(value: unknown) {
  emit('update:modelValue', { ...props.modelValue, title: String(value ?? '') })
}
function updateTime(id: string, field: 'startAt' | 'endAt', value: unknown) {
  emit('update:modelValue', {
    ...props.modelValue,
    slots: props.modelValue.slots.map((slot) =>
      slot.id === id ? { ...slot, [field]: String(value ?? '') } : slot
    ),
  })
}
function add() {
  const slot: BookingSlot = { id: crypto.randomUUID(), startAt: '', endAt: '' }
  emit('update:modelValue', {
    ...props.modelValue,
    slots: [...props.modelValue.slots, slot],
  })
}
function remove(id: string) {
  emit('update:modelValue', {
    ...props.modelValue,
    slots: props.modelValue.slots.filter((slot) => slot.id !== id),
  })
}
</script>

<style scoped>
.booking-configuration {
  display: grid;
  gap: calc(var(--spacing) * 5);
}
.booking-configuration__slot {
  display: grid;
  gap: calc(var(--spacing) * 4);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  padding: calc(var(--spacing) * 4);
  min-width: 0;
}
</style>
