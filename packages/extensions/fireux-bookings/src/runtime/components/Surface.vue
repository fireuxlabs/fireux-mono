<template>
  <UCard class="booking-surface">
    <template #header>
      <h2>
        {{
          flow.confirmed.value?.title || configuration.title.trim() || 'Booking'
        }}
      </h2>
    </template>
    <div ref="body" class="booking-surface__body">
      <ol
        v-if="!flow.confirmed.value"
        class="booking-surface__steps"
        aria-label="Booking progress"
      >
        <li
          v-for="(label, index) in steps"
          :key="label"
          :aria-current="flow.step.value === index ? 'step' : undefined"
        >
          <span>{{ index + 1 }}</span> {{ label }}
        </li>
      </ol>
      <h3 ref="heading" tabindex="-1">
        {{ flow.confirmed.value ? 'Your booking' : steps[flow.step.value] }}
      </h3>
      <BookingTimeSelection
        v-if="flow.step.value === 0"
        :slots="flow.slots.value"
        :selected="flow.slotId.value"
        @select="flow.selectTime"
      />
      <UButton
        v-if="flow.step.value === 0"
        :disabled="!flow.selectedSlot.value"
        @click="flow.next"
        >Continue</UButton
      >
      <BookingContact
        v-if="flow.step.value === 1"
        :contact="flow.contact.value"
        :ready="flow.contactReady.value"
        @update:contact="flow.updateContact"
        @continue="flow.next"
        @back="flow.back"
      />
      <BookingReview
        v-if="flow.step.value === 2 && flow.selectedSlot.value"
        :slot="flow.selectedSlot.value"
        :contact="flow.contact.value"
        :pending="flow.pending.value"
        :error="flow.error.value"
        @back="flow.back"
        @confirm="flow.submit"
      />
      <BookingConfirmation
        v-if="flow.confirmed.value"
        :booking="flow.confirmed.value"
        @restart="flow.restart"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import BookingTimeSelection from './TimeSelection.vue'
import BookingContact from './Contact.vue'
import BookingReview from './Review.vue'
import BookingConfirmation from './Confirmation.vue'
import { useBookingFlow } from '../composables/useBookingFlow'
import type {
  BookingConfiguration,
  BookingConfirmationHandler,
} from '../types/booking-surface'

const props = defineProps<{
  configuration: BookingConfiguration
  confirm: BookingConfirmationHandler
}>()
const flow = useBookingFlow(
  () => props.configuration,
  () => props.confirm
)
const steps = ['Choose a time', 'Your details', 'Review']
const heading = ref<HTMLElement>()
const body = ref<HTMLElement>()
watch(flow.step, async () => {
  const ownsFocus =
    typeof document !== 'undefined' &&
    body.value?.contains(document.activeElement)
  await nextTick()
  if (ownsFocus) heading.value?.focus()
})
</script>

<style scoped>
.booking-surface {
  width: 100%;
}
.booking-surface__body {
  display: grid;
  gap: calc(var(--spacing) * 5);
}
.booking-surface__steps {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 4);
  padding: 0;
  margin: 0;
  list-style: none;
  color: var(--ui-text-muted);
}
.booking-surface__steps [aria-current='step'] {
  color: var(--ui-primary);
  font-weight: 600;
}
.booking-surface__steps span {
  font-variant-numeric: tabular-nums;
}
</style>
