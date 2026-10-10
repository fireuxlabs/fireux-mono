<!-- Concurrent edit — 2026-07-19 17:12 CEST — Pre-order pass: support mandatory scheduled-only surface timing. -->
<!-- Concurrent edit — 2026-07-20 15:22 CEST — Pre-order intake pass: separate always-open request intake from selectable fulfilment times. -->
<template>
  <UCard>
    <template #header>
      <h2>Scheduling</h2>
      <p v-if="isPreOrder" class="timing-explanation">
        Guests can send requests outside serving hours. Advance notice and the
        offering’s serving hours determine the available dining times.
      </p>
      <p v-else class="timing-explanation">
        Preparation time and scheduling use this offering’s serving hours.
      </p>
    </template>

    <div class="grid gap-6">
      <div class="grid gap-4 md:grid-cols-2">
        <MoleculesFormsEditableCheckbox
          :capture-intent="captureIntent"
          v-if="allowAsap"
          :label="`Immediate ${interactionLabel.toLowerCase()}`"
          :display-label="`ASAP ${interactionLabel.toLowerCase()}`"
          :checkbox-label="`Allow ‘As soon as possible’ while ${interactionLabel} is open`"
          true-label="Available"
          false-label="Scheduled only"
          :value="asapEnabled"
          :disabled="disabled"
          disabled-message="This Kitchen is read-only."
          :update="updateAsapEnabled"
        />

        <MoleculesFormsEditableSimpleField
          :capture-intent="captureIntent"
          :label="noticeLabel"
          type="number"
          :value="noticeValue"
          :placeholder="isPreOrder ? '24' : '45'"
          :maxlength="5"
          :disabled="disabled"
          disabled-message="This Kitchen is read-only."
          :validation-function="validateNotice"
          :update="updateNotice"
        />

        <MoleculesFormsEditableSelect
          :capture-intent="captureIntent"
          :label="`${timeLabel} interval`"
          :value="slotIntervalMinutes"
          :options="slotIntervalOptions"
          :disabled="disabled"
          disabled-message="This Kitchen is read-only."
          :update="updateSlotInterval"
        />

        <MoleculesFormsEditableSimpleField
          :capture-intent="captureIntent"
          label="Scheduling horizon (days)"
          type="number"
          :value="scheduleHorizonDays"
          placeholder="7"
          :maxlength="2"
          :disabled="disabled"
          disabled-message="This Kitchen is read-only."
          :validation-function="validateScheduleHorizon"
          :update="updateScheduleHorizon"
        />
      </div>

      <MoleculesFormsEditableSimpleField
        :capture-intent="captureIntent"
        label="Customer message"
        type="textarea"
        :rows="2"
        :maxlength="240"
        :value="message"
        :placeholder="customerMessagePlaceholder"
        :disabled="disabled"
        disabled-message="This Kitchen is read-only."
        :update="updateMessage"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ValidationResult } from 'fireux-core/runtime/composables/forms/useEditableStringField'
import type { KitchenOrderTypeConfig } from '../../../models/ordering.model'

type UpdateFn = (
  patch: Partial<KitchenOrderTypeConfig>,
  isSurfaceCurrent?: () => boolean
) => Promise<void>

const props = withDefaults(
  defineProps<{
    allowAsap?: boolean
    config: KitchenOrderTypeConfig
    customerMessagePlaceholder: string
    disabled?: boolean
    captureIntent?: () => () => boolean
    interactionLabel: string
    timeLabel: string
    updateFunction: UpdateFn
  }>(),
  {
    allowAsap: true,
  }
)

const slotIntervalOptions = [15, 30, 45, 60].map((value) => ({
  label: `${value} minutes`,
  value: String(value),
}))
const asapEnabled = computed(() => props.config.asap_enabled !== false)
const isPreOrder = computed(() => props.config.type === 'pre_order')
const noticeLabel = computed(() =>
  isPreOrder.value ? 'Advance notice (hours)' : 'Preparation time (minutes)'
)
const noticeValue = computed(() =>
  isPreOrder.value
    ? (props.config.notice_hours ?? 0)
    : Math.round((props.config.notice_hours ?? 0) * 60)
)
const slotIntervalMinutes = computed(() =>
  String(props.config.slot_interval_minutes || 30)
)
const scheduleHorizonDays = computed(
  () => props.config.schedule_horizon_days || 7
)
const message = computed(() => String(props.config.message || ''))
const validNumber = (
  value: string,
  minimum: number,
  maximum: number,
  label: string
): ValidationResult => {
  const number = Number(value)

  return Number.isFinite(number) && number >= minimum && number <= maximum
    ? { isValid: true }
    : {
        isValid: false,
        message: `${label} must be between ${minimum} and ${maximum}.`,
      }
}
const validateNotice = (value: string): ValidationResult => {
  if (isPreOrder.value) return validNumber(value, 0, 168, 'Advance notice')
  const minutes = Number(value)

  return Number.isInteger(minutes) && minutes >= 0 && minutes <= 10_080
    ? { isValid: true }
    : {
        isValid: false,
        message: 'Minimum preparation time must be 0 to 10,080 whole minutes.',
      }
}
const validateScheduleHorizon = (value: string) =>
  validNumber(value, 1, 30, 'Scheduling horizon')
const updateAsapEnabled = (value: boolean, isSurfaceCurrent?: () => boolean) =>
  props.updateFunction({ asap_enabled: value }, isSurfaceCurrent)
const updateNotice = (value: string, isSurfaceCurrent?: () => boolean) =>
  props.updateFunction(
    {
      notice_hours: isPreOrder.value ? Number(value) : Number(value) / 60,
    },
    isSurfaceCurrent
  )
const updateSlotInterval = (value: string, isSurfaceCurrent?: () => boolean) =>
  props.updateFunction(
    { slot_interval_minutes: Number(value) },
    isSurfaceCurrent
  )
const updateScheduleHorizon = (
  value: string,
  isSurfaceCurrent?: () => boolean
) =>
  props.updateFunction(
    { schedule_horizon_days: Math.round(Number(value)) },
    isSurfaceCurrent
  )
const updateMessage = (value: string, isSurfaceCurrent?: () => boolean) =>
  props.updateFunction({ message: value }, isSurfaceCurrent)
</script>

<style scoped>
.timing-explanation {
  margin: 0.5rem 0 0;
  font-size: var(--text-sm);
  color: var(--ui-text-muted);
}
</style>
