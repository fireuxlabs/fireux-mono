<template>
  <UCard id="service-hours" class="scroll-mt-24">
    <template #header>
      <h2 class="font-semibold">Serving hours</h2>
      <p class="mt-1 text-sm text-muted">
        When customers can collect or receive their food. Preparation time is
        set for each ordering option below.
      </p>
    </template>
    <UAlert
      v-if="!timezone"
      title="Set the venue timezone before adding serving hours"
      color="warning"
      :actions="[
        { label: 'Venue settings', to: '/workspace/kitchen/identity/place' },
      ]"
    />
    <MoleculesFormsEditableSimpleField
      label="Weekly serving hours"
      type="textarea"
      :rows="7"
      :value="hoursText"
      placeholder="Tuesday - Saturday 17:00 - 22:00"
      :disabled="disabled || !timezone"
      :validation-function="validateHours"
      :update="saveHours"
    />
    <PlaceOpeningHoursWeek
      v-if="service.hours?.windows.length"
      :hours="service.hours"
      compact
      class="mt-4"
    />
    <p v-if="timezone" class="mt-3 text-xs text-muted">
      Local time · {{ timezone }}
    </p>
  </UCard>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import PlaceOpeningHoursWeek from 'fireux-places/runtime/place/components/OpeningHours/Week.vue'
import type {
  KitchenService,
  KitchenServiceChanges,
} from '../../../models/service.model'
import {
  formatWeekdayTimeText,
  parseWeekdayTimeText,
} from '../../../../utils/weekday-time'
const props = defineProps<{
  service: KitchenService
  timezone: string
  disabled?: boolean
  update: (changes: KitchenServiceChanges) => Promise<void>
}>()
const timezone = computed(() => props.service.hours?.timezone || props.timezone)
const hoursText = computed(() => formatWeekdayTimeText(props.service.hours))
function validateHours(value: string) {
  try {
    if (!timezone.value) throw new Error('Set the venue timezone first.')
    if (!parseWeekdayTimeText(value, timezone.value).windows.length)
      throw new Error('Add at least one serving time.')
    return { isValid: true }
  } catch (cause) {
    return {
      isValid: false,
      message: cause instanceof Error ? cause.message : 'Check serving hours.',
    }
  }
}
async function saveHours(value: string) {
  const result = validateHours(value)
  if (!result.isValid) throw new Error(result.message)
  await props.update({ hours: parseWeekdayTimeText(value, timezone.value) })
}
</script>
