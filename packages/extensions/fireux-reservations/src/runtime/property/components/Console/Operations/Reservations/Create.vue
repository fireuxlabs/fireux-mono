<template>
  <UCard>
    <template #header>
      <div>
        <p class="font-semibold">Direct booking</p>
        <p class="text-xs text-dimmed">
          Add a phone, email or walk-in reservation to the shared calendar.
        </p>
      </div>
    </template>

    <form class="space-y-5" @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField label="Guest name" required>
          <UInput v-model="form.guestName" class="w-full" />
        </UFormField>
        <UFormField label="Status">
          <USelect
            v-model="form.status"
            :items="statusItems"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Arrival" required>
          <UInput v-model="form.arrivalDate" type="date" class="w-full" />
        </UFormField>
        <UFormField label="Departure" required>
          <UInput v-model="form.departureDate" type="date" class="w-full" />
        </UFormField>
        <UFormField label="Email">
          <UInput v-model="form.email" type="email" class="w-full" />
        </UFormField>
        <UFormField label="Phone">
          <UInput v-model="form.phone" type="tel" class="w-full" />
        </UFormField>
        <UFormField label="Adults">
          <UInput v-model.number="form.adults" type="number" min="1" class="w-full" />
        </UFormField>
        <UFormField label="Children">
          <UInput v-model.number="form.children" type="number" min="0" class="w-full" />
        </UFormField>
        <UFormField label="Total">
          <UInput v-model.number="form.total" type="number" min="0" step="0.01" class="w-full" />
        </UFormField>
        <UFormField label="Currency">
          <UInput v-model="form.currency" maxlength="3" class="w-full uppercase" />
        </UFormField>
      </div>

      <UFormField label="Host notes">
        <UTextarea
          v-model="form.notes"
          :rows="4"
          class="w-full"
          placeholder="Arrival context, accessibility needs or follow-up."
        />
      </UFormField>

      <UAlert
        v-if="formError"
        color="error"
        variant="soft"
        title="Booking not saved"
        :description="formError"
      />

      <div class="flex justify-end gap-2">
        <UButton
          to="/console/property/reservations"
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
import { reactive, ref } from 'vue'
import type { ReservationStatus } from '../../../../models/reservation.model.ts'
import { usePropertyReservations } from '../../../../composables/console/operations/Reservations/usePropertyReservations'
import { useReservationCreate } from '../../../../composables/console/operations/Reservations/useReservationCreate'

const {
  runtimeProperty,
  collection,
  canWrite,
} = usePropertyReservations()
const { createReservation } = useReservationCreate(collection, runtimeProperty)
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

async function submit() {
  if (!canWrite.value || saving.value) return

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
      total: amount > 0
        ? {
            amount_minor: Math.round(amount * 100),
            currency_code: form.currency.trim().toUpperCase() || 'CHF',
          }
        : null,
      notes: form.notes,
    })
    toast.add({
      title: 'Booking added',
      description: 'The stay is now visible in the property calendar.',
      color: 'success',
    })
    await navigateTo(`/console/property/reservations/${reservationId}`)
  } catch (error) {
    formError.value = error instanceof Error
      ? error.message
      : 'The booking could not be saved.'
  } finally {
    saving.value = false
  }
}
</script>
