<template>
  <UCard>
    <template #header>
      <div>
        <p>Direct booking</p>
        <p>Add a phone, email or walk-in reservation to the shared calendar.</p>
      </div>
    </template>

    <form
      class="workspace-surface workspace-surface--compact"
      @submit.prevent="submit"
    >
      <div class="workspace-surface__grid workspace-surface__grid--2">
        <UFormField label="Guest name" required>
          <UInput v-model="form.guestName" />
        </UFormField>
        <UFormField label="Status">
          <USelect v-model="form.status" :items="statusItems" />
        </UFormField>
        <UFormField label="Arrival" required>
          <UInput v-model="form.arrivalDate" type="date" />
        </UFormField>
        <UFormField label="Departure" required>
          <UInput v-model="form.departureDate" type="date" />
        </UFormField>
        <UFormField label="Email">
          <UInput v-model="form.email" type="email" />
        </UFormField>
        <UFormField label="Phone">
          <UInput v-model="form.phone" type="tel" />
        </UFormField>
        <UFormField label="Adults">
          <UInput v-model.number="form.adults" type="number" min="1" />
        </UFormField>
        <UFormField label="Children">
          <UInput v-model.number="form.children" type="number" min="0" />
        </UFormField>
        <UFormField label="Total">
          <UInput
            v-model.number="form.total"
            type="number"
            min="0"
            step="0.01"
          />
        </UFormField>
        <UFormField label="Currency">
          <UInput v-model="form.currency" maxlength="3" />
        </UFormField>
      </div>

      <UFormField label="Host notes">
        <UTextarea
          v-model="form.notes"
          :rows="4"
          placeholder="Arrival context, accessibility needs or follow-up."
        />
      </UFormField>

      <UAlert
        v-if="formError"
        color="error"
        variant="soft"
        title="Booking not saved"
        :description="formError"
      >
        <template #actions><FireCopyError :message="formError" /></template>
      </UAlert>

      <div>
        <UButton
          to="/workspace/property/reservations"
          color="neutral"
          variant="ghost"
        >
          Cancel
        </UButton>
        <UButton
          type="submit"
          icon="i-lucide-calendar-plus-2"
          :loading="saving"
          :disabled="saving || !canWrite"
        >
          Add booking
        </UButton>
      </div>
    </form>
  </UCard>
</template>

<script setup lang="ts">
import { usePropertyScope } from 'fireux-properties/runtime/property/composables/usePropertyScope'
import { usePropertyWorkspace } from 'fireux-properties/runtime/property/composables/workspace/usePropertyWorkspace'

import { reactive, ref, watch } from 'vue'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import type { ReservationStatus } from '../../../models/reservation.model.ts'
import { usePropertyReservations } from '../../../composables/reservations/usePropertyReservations'
import { useReservationCreate } from '../../../composables/reservations/useReservationCreate'

const { runtimeProperty, collection, canWrite } = usePropertyReservations(
  usePropertyScope(usePropertyWorkspace().id)
)
const { createReservation, captureIntent } = useReservationCreate(
  collection,
  runtimeProperty
)
const toast = useToast()
const saving = ref(false)
const formError = ref('')
const form = reactive({
  guestName: '',
  email: '',
  phone: '',
  status: 'confirmed' as ReservationStatus,
  arrivalDate: '',
  departureDate: '',
  adults: 2,
  children: 0,
  total: 0,
  currency: 'CHF',
  notes: '',
})
const statusItems = [
  { label: 'Enquiry', value: 'inquiry' },
  { label: 'Hold', value: 'hold' },
  { label: 'Confirmed', value: 'confirmed' },
]

const captureDraft = useCommandScope([
  () => JSON.stringify(form),
  () => runtimeProperty.id.value,
  canWrite,
])
watch(
  [() => JSON.stringify(form), () => runtimeProperty.id.value, canWrite],
  () => {
    saving.value = false
    formError.value = ''
  },
  { flush: 'sync' }
)
async function submit() {
  if (!canWrite.value || saving.value) return

  const local = captureDraft()
  const owner = captureIntent()
  const isCurrent = () => local() && owner()
  saving.value = true
  formError.value = ''
  try {
    const amount = Number(form.total)
    const reservationId = await createReservation({
      guest: {
        display_name: form.guestName,
        email: form.email,
        phone: form.phone,
      },
      source: 'direct',
      external_reference: '',
      status: form.status,
      arrival_date: form.arrivalDate,
      departure_date: form.departureDate,
      adults: form.adults,
      children: form.children,
      total:
        amount > 0
          ? {
              amount_minor: Math.round(amount * 100),
              currency_code: form.currency.trim().toUpperCase() || 'CHF',
            }
          : null,
      notes: form.notes,
    })
    if (!isCurrent()) return
    toast.add({
      title: 'Booking added',
      description: 'The stay is now visible in the property calendar.',
      color: 'success',
    })
    await navigateTo(`/workspace/property/reservations/${reservationId}`)
  } catch (error) {
    if (!isCurrent()) return
    formError.value =
      error instanceof Error ? error.message : 'The booking could not be saved.'
  } finally {
    if (local()) saving.value = false
  }
}
</script>
