<template>
  <form class="booking-contact" @submit.prevent="$emit('continue')">
    <UFormField label="Your name" name="bookingName">
      <UInput
        :model-value="contact.name"
        autocomplete="name"
        maxlength="100"
        required
        @update:model-value="update('name', $event)"
      />
    </UFormField>
    <UFormField label="Email address" name="bookingEmail">
      <UInput
        :model-value="contact.email"
        type="email"
        autocomplete="email"
        maxlength="254"
        required
        @update:model-value="update('email', $event)"
      />
    </UFormField>
    <div class="booking-contact__actions">
      <UButton
        type="button"
        color="neutral"
        variant="outline"
        @click="$emit('back')"
        >Back</UButton
      >
      <UButton type="submit" :disabled="!ready">Review booking</UButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { BookingContact } from '../types/booking-surface'
const props = defineProps<{ contact: BookingContact; ready: boolean }>()
const emit = defineEmits<{
  'update:contact': [contact: BookingContact]
  continue: []
  back: []
}>()
function update(field: 'name' | 'email', value: unknown) {
  emit('update:contact', {
    ...props.contact,
    [field]: typeof value === 'string' ? value : '',
  })
}
</script>

<style scoped>
.booking-contact {
  display: grid;
  gap: calc(var(--spacing) * 5);
}
.booking-contact__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
}
</style>
