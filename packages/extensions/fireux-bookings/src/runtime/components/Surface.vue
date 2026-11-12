<template>
  <UPageCard class="booking-surface" icon="i-lucide-calendar-days">
    <template #title>
      <h2>
        {{
          flow.confirmed.value?.title || configuration.title.trim() || 'Booking'
        }}
      </h2>
    </template>
    <div ref="body" class="booking-surface__body">
      <UStepper
        v-if="!flow.confirmed.value"
        :model-value="flow.step.value"
        :items="stepItems"
        size="sm"
        @update:model-value="navigateBack"
      />
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
  </UPageCard>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
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
const stepItems = computed(() =>
  steps.map((title, index) => ({
    title,
    disabled: flow.pending.value || index > flow.step.value,
  }))
)
function navigateBack(value: string | number | undefined) {
  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value < 0 ||
    value > 2 ||
    flow.pending.value
  )
    return
  while (flow.step.value > value && flow.step.value <= 2) flow.back()
}
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
  gap: calc(var(--spacing) * 6);
}
</style>
