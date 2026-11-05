<template>
  <UCard>
    <template #header>Availability</template>
    <form class="booking-availability" @submit.prevent="save">
      <fieldset><legend>Working days</legend><UCheckbox v-for="(day, index) in days" :key="day" :label="day" :model-value="draft.openWeekdays.includes(index)" @update:model-value="toggle(index, $event === true)" /></fieldset>
      <UFormField label="Departure time" description="Local time configured by your booking service."><UInput v-model="draft.departureTime" type="time" required /></UFormField>
      <UFormField label="Close a date"><UInput v-model="date" type="date" /><UButton type="button" label="Add closed date" variant="soft" :disabled="!date" @click="closeDate" /></UFormField>
      <ul><li v-for="closed in draft.closedDates" :key="closed">{{ closed }} <UButton type="button" label="Reopen" variant="ghost" @click="draft.closedDates = draft.closedDates.filter((value) => value !== closed)" /></li></ul>
      <p>Save to apply changes to new bookings. Existing bookings remain reserved. Clear all working days to pause new bookings.</p>
      <UButton type="submit" label="Save availability" :loading="busy" :disabled="busy" />
      <p v-if="error" role="alert">{{ error }}</p>
    </form>
  </UCard>
</template>
<script setup lang="ts">
import { onScopeDispose, reactive, ref } from 'vue'
import type { BookingAvailability } from '../../../models/business-bookings'
import { isBookingDate } from '../../../utils/availability'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
const props = defineProps<{ businessId: string; availability: BookingAvailability }>()
const emit = defineEmits<{ saved: [] }>()
const { currentUser } = useAuth()
const appSession = useAppSession()
const capture = useCommandScope([currentUser, () => props.businessId, appSession.appUser])
const draft = reactive({ ...props.availability, openWeekdays: [...props.availability.openWeekdays], closedDates: [...props.availability.closedDates] })
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const date = ref(''), error = ref(''), busy = ref(false)
let active = true
onScopeDispose(() => { active = false })
function toggle(index: number, enabled: boolean) { draft.openWeekdays = enabled ? [...new Set([...draft.openWeekdays, index])] : draft.openWeekdays.filter((day) => day !== index) }
function closeDate() { if (isBookingDate(date.value) && !draft.closedDates.includes(date.value)) draft.closedDates.push(date.value); draft.closedDates.sort(); date.value = '' }
async function save() {
  if (busy.value) return
  const user = currentUser.value, businessId = props.businessId, isCurrent = capture()
  const availability = { ...draft, openWeekdays: [...draft.openWeekdays], closedDates: [...draft.closedDates] }
  busy.value = true; error.value = ''
  try {
    if (!user) throw new Error('Sign in to manage availability.')
    const token = await user.getIdToken()
    if (!isCurrent() || !active) throw new Error('Business or account changed.')
    await $fetch('/api/workspace/business/bookings/availability', { method: 'PUT', retry: 0, body: { businessId, availability }, headers: { authorization: `Bearer ${token}` } })
    if (active && isCurrent()) emit('saved')
  } catch (cause) { if (active && isCurrent()) error.value = cause instanceof Error ? cause.message : 'Availability could not be saved.' }
  finally { if (active) busy.value = false }
}
</script>
<style scoped>
.booking-availability { display: grid; gap: var(--space-4, 1rem); }
</style>
