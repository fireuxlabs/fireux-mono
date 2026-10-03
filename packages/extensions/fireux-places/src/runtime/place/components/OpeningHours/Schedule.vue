<template>
  <div>
    <p v-if="!hours.windows.length" class="mb-4 text-sm text-muted">
      Add your regular weekly hours to get started.
    </p>
    <PlaceOpeningHoursWeek
      :hours="hours"
      editable
      :disabled="disabled"
      :compact="compact"
      @edit="edit"
    />
    <UModal
      v-model:open="open"
      title="Edit opening hours"
      :dismissible="!saving"
      :ui="{ content: 'sm:max-w-xl' }"
    >
      <template #body>
        <form class="space-y-6" @submit.prevent="save">
          <fieldset>
            <legend class="mb-3 text-sm font-medium">Apply to</legend>
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="day in openingDays"
                :key="day"
                :label="label(day).slice(0, 3)"
                :aria-label="label(day)"
                :aria-pressed="selectedDays.includes(day)"
                :variant="selectedDays.includes(day) ? 'solid' : 'outline'"
                :color="selectedDays.includes(day) ? 'primary' : 'neutral'"
                :disabled="saving"
                @click="toggleDay(day)"
              />
            </div>
          </fieldset>
          <UFormField label="Hours">
            <USelect
              v-model="mode"
              :items="modes"
              :disabled="saving"
              class="w-full"
            />
          </UFormField>
          <div v-if="mode === 'hours'" class="space-y-3">
            <div
              v-for="(range, index) in draft"
              :key="index"
              class="hours-range"
            >
              <UFormField :label="index === 0 ? 'Opens' : 'Reopens'">
                <UInput
                  v-model="range.open"
                  type="time"
                  :disabled="saving"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Closes">
                <UInput
                  v-model="range.close"
                  type="time"
                  :disabled="saving"
                  class="w-full"
                />
              </UFormField>
              <UButton
                icon="i-lucide-x"
                :aria-label="`Remove time ${index + 1}`"
                color="neutral"
                variant="ghost"
                :disabled="saving || draft.length === 1"
                @click="draft.splice(index, 1)"
              />
              <p
                v-if="range.close && range.close <= range.open"
                class="hours-range__note text-xs text-muted"
              >
                Closes the following day.
              </p>
            </div>
            <UButton
              label="Add another opening time"
              icon="i-lucide-plus"
              color="neutral"
              variant="ghost"
              :disabled="saving"
              @click="draft.push({ open: '18:00', close: '22:00' })"
            />
          </div>
          <p v-if="selectedDays.length > 1" class="text-sm text-muted">
            These hours will replace the hours on each selected day.
          </p>
          <UAlert
            v-if="error"
            :description="error"
            title="Could not save hours"
            color="error"
          >
            <template #actions
              ><MoleculesCopyError :message="error"
            /></template>
          </UAlert>
          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              color="neutral"
              variant="ghost"
              :disabled="saving"
              @click="open = false"
            />
            <UButton
              label="Save hours"
              type="submit"
              :loading="saving"
              :disabled="!selectedDays.length || !timezone"
            />
          </div>
          <p v-if="!timezone" class="text-sm text-muted">
            Add your timezone before saving opening hours.
          </p>
        </form>
      </template>
    </UModal>
  </div>
</template>
<script setup lang="ts">
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { computed, ref, watch } from 'vue'
import type {
  PlaceBusinessHours,
  PlaceBusinessHoursDay,
} from '../../models/place.model'
import {
  openingDays,
  replaceOpeningDays,
  type OpeningRange,
} from '../../utils/opening-hours-editor'

const props = withDefaults(
  defineProps<{
    captureIntent?: () => () => boolean
    hours: PlaceBusinessHours
    timezone: string
    update: (hours: PlaceBusinessHours) => Promise<void>
    disabled?: boolean
    compact?: boolean
  }>(),
  { disabled: false, compact: false }
)
const hours = computed(() => props.hours)
const timezone = computed(() => props.timezone)
const label = (day: string) => day.charAt(0).toUpperCase() + day.slice(1)
const rangesFor = (day: PlaceBusinessHoursDay): OpeningRange[] =>
  hours.value.windows
    .filter((window) => window.days.includes(day))
    .map(({ open, close }) => ({ open, close }))
    .sort((a, b) => a.open.localeCompare(b.open))
const open = ref(false)
const selectedDays = ref<PlaceBusinessHoursDay[]>([])
const draft = ref<OpeningRange[]>([])
const mode = ref<'hours' | 'closed' | 'all-day'>('hours')
const modes = [
  { label: 'Set opening times', value: 'hours' },
  { label: 'Closed', value: 'closed' },
  { label: 'Open 24 hours', value: 'all-day' },
]
const saving = ref(false)
const error = ref('')
let original = ''
function edit(day: PlaceBusinessHoursDay) {
  original = JSON.stringify([hours.value, timezone.value])
  selectedDays.value = [day]
  const ranges = rangesFor(day)
  mode.value = ranges.some(
    (range) => range.open === '00:00' && range.close === '00:00'
  )
    ? 'all-day'
    : ranges.length
      ? 'hours'
      : hours.value.windows.length
        ? 'closed'
        : 'hours'
  draft.value = ranges.length ? ranges : [{ open: '09:00', close: '17:00' }]
  error.value = ''
  open.value = true
}
function toggleDay(day: PlaceBusinessHoursDay) {
  selectedDays.value = selectedDays.value.includes(day)
    ? selectedDays.value.filter((value) => value !== day)
    : [...selectedDays.value, day]
}
const sources = [open, selectedDays, mode, () => JSON.stringify(draft.value), () => props.captureIntent ? undefined : props.disabled,
  () => props.update, () => JSON.stringify([hours.value, timezone.value])]
const capture = useCommandScope(sources)
watch(sources, () => { saving.value = false }, { flush: 'sync' })
async function save() {
  if (saving.value) return
  error.value = ''
  const local = capture()
  const owner = props.captureIntent?.() ?? (() => true)
  const isCurrent = () => local() && owner()
  try {
    if (props.disabled) throw new Error('Editing is not available.')
    if (JSON.stringify([hours.value, timezone.value]) !== original)
      throw new Error(
        'These hours changed while you were editing. Reopen the editor.'
      )
    if (!timezone.value) throw new Error('Add your timezone first.')
    const ranges =
      mode.value === 'closed'
        ? []
        : mode.value === 'all-day'
          ? [{ open: '00:00', close: '00:00' }]
          : draft.value
    if (mode.value === 'hours' && !ranges.length)
      throw new Error('Add an opening time.')
    const next = replaceOpeningDays(hours.value, selectedDays.value, ranges)
    saving.value = true
    await props.update(next)
    if (isCurrent()) { saving.value = false; open.value = false }
  } catch (cause) {
    if (!isCurrent()) return
    error.value =
      cause instanceof Error ? cause.message : 'Hours could not be saved.'
  } finally {
    if (local()) saving.value = false
  }
}
</script>
<style scoped>
.hours-range {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  align-items: end;
  gap: 0.75rem;
}
.hours-range__note {
  grid-column: 1 / -1;
}
</style>
