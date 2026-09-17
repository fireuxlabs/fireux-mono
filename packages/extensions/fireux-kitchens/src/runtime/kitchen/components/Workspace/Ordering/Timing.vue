<!-- Concurrent edit — 2026-07-19 17:12 CEST — Pre-order pass: support mandatory scheduled-only surface timing. -->
<!-- Concurrent edit — 2026-07-20 15:22 CEST — Pre-order intake pass: separate always-open request intake from selectable fulfilment times. -->
<template>
  <UCard>
    <template #header><h2>Timing</h2></template>

    <div class="grid gap-6">
      <div class="grid gap-4 md:grid-cols-2">
        <MoleculesFormsEditableCheckbox
          v-if="allowAsap"
          :label="`Immediate ${serviceLabel.toLowerCase()}`"
          :display-label="`ASAP ${serviceLabel.toLowerCase()}`"
          :checkbox-label="`Allow ‘As soon as possible’ while ${serviceLabel} is open`"
          true-label="Available"
          false-label="Scheduled only"
          :value="asapEnabled"
          :disabled="disabled"
          disabled-message="This Kitchen is read-only."
          :update="updateAsapEnabled"
        />

        <MoleculesFormsEditableSimpleField
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
          :label="`${timeLabel} interval`"
          :value="slotIntervalMinutes"
          :options="slotIntervalOptions"
          :disabled="disabled"
          disabled-message="This Kitchen is read-only."
          :update="updateSlotInterval"
        />

        <MoleculesFormsEditableSimpleField
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

      <div class="grid gap-4 rounded-lg border border-default p-4">
        <MoleculesFormsEditableCheckbox
          :label="`${serviceLabel} service hours`"
          display-label="Hours source"
          checkbox-label="Use Kitchen hours"
          true-label="Kitchen hours"
          false-label="Custom hours"
          :value="inheritKitchenHours"
          :disabled="disabled"
          disabled-message="This Kitchen is read-only."
          :update="updateHoursInheritance"
        />

        <UAlert
          v-if="inheritKitchenHours"
          :color="kitchenHours.windows.length ? 'neutral' : 'warning'"
          variant="soft"
          icon="i-lucide-clock"
          :title="
            kitchenHours.windows.length
              ? `${serviceLabel} follows Kitchen hours`
              : 'Kitchen hours are missing'
          "
          :description="
            kitchenHours.windows.length
              ? inheritedHoursSummary
              : `Add Kitchen hours or switch to custom ${serviceLabel} hours.`
          "
        />

        <MoleculesFormsEditableSimpleField
          v-else
          :label="`Custom ${serviceLabel} hours`"
          type="textarea"
          :rows="7"
          :value="customHoursText"
          placeholder="Tuesday - Saturday 08:00 - 13:00"
          :disabled="disabled"
          disabled-message="This Kitchen is read-only."
          :validation-function="validateCustomHours"
          :update="updateCustomHours"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ValidationResult } from 'fireux-core/runtime/composables/forms/useEditableStringField'
import type { KitchenOrderTypeConfig } from '../../../models/ordering.model'
import type { WeekdayTimeWindowsConfig } from '../../../../models/shared/weekday-time.model.ts'
import {
  formatWeekdayTimeText,
  parseWeekdayTimeText,
} from '../../../../utils/weekday-time'

type UpdateFn = (patch: Partial<KitchenOrderTypeConfig>) => Promise<void>

const props = withDefaults(
  defineProps<{
    allowAsap?: boolean
    config: KitchenOrderTypeConfig
    customerMessagePlaceholder: string
    disabled?: boolean
    kitchenHours: WeekdayTimeWindowsConfig
    serviceLabel: string
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
const customRequested = ref(false)
watch(
  () => props.config,
  () => {
    customRequested.value = false
  }
)
const inheritKitchenHours = computed(
  () =>
    !customRequested.value &&
    props.config.service_hours?.inherit_kitchen_operation_hours !== false
)
const customHoursText = computed(() =>
  formatWeekdayTimeText(props.config.service_hours?.operation_hours)
)
const inheritedHoursSummary = computed(() =>
  formatWeekdayTimeText(props.kitchenHours)
)

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
const validateCustomHours = (value: string): ValidationResult => {
  try {
    const hours = parseWeekdayTimeText(value, props.kitchenHours.timezone)
    return hours.windows.length
      ? { isValid: true }
      : {
          isValid: false,
          message: `Add at least one ${props.serviceLabel}-hours range.`,
        }
  } catch (error) {
    return {
      isValid: false,
      message:
        error instanceof Error
          ? error.message
          : `${props.serviceLabel} hours are invalid.`,
    }
  }
}

const updateAsapEnabled = (value: boolean) =>
  props.updateFunction({ asap_enabled: value })
const updateNotice = (value: string) =>
  props.updateFunction({
    notice_hours: isPreOrder.value ? Number(value) : Number(value) / 60,
  })
const updateSlotInterval = (value: string) =>
  props.updateFunction({ slot_interval_minutes: Number(value) })
const updateScheduleHorizon = (value: string) =>
  props.updateFunction({ schedule_horizon_days: Math.round(Number(value)) })
const updateMessage = (value: string) =>
  props.updateFunction({ message: value })
const updateHoursInheritance = async (value: boolean) => {
  if (!value) {
    customRequested.value = true
    return
  }
  await props.updateFunction({
    service_hours: { inherit_kitchen_operation_hours: true },
  })
}
const updateCustomHours = (value: string) =>
  props.updateFunction({
    service_hours: {
      inherit_kitchen_operation_hours: false,
      operation_hours: parseWeekdayTimeText(value, props.kitchenHours.timezone),
    },
  })
</script>
