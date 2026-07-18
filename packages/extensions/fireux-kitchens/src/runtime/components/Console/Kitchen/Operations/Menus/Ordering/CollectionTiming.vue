<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 class="text-sm font-semibold text-highlighted">Collection timing</h3>
          <p class="text-sm text-dimmed">
            Define when customers can collect and which pickup times they can choose.
          </p>
        </div>
        <UBadge color="success" variant="soft">Field editable</UBadge>
      </div>
    </template>

    <div class="grid gap-6">
      <div class="grid gap-4 md:grid-cols-2">
        <MoleculesFormsFirestoreCheckbox
          label="Immediate collection"
          display-label="Queue collection"
          checkbox-label="Allow ‘As soon as possible’ while Collection is open"
          true-label="Available"
          false-label="Scheduled only"
          :firebase-value="asapEnabled"
          :disabled="disabled"
          disabled-message="This menu is read-only."
          :update-function="updateAsapEnabled"
        />

        <MoleculesFormsFirestoreSimpleField
          label="Minimum notice"
          type="number"
          :firebase-value="noticeHours"
          placeholder="0.5"
          :maxlength="6"
          :disabled="disabled"
          disabled-message="This menu is read-only."
          :validation-function="validateNoticeHours"
          :update-function="updateNoticeHours"
        />

        <MoleculesFormsFirestoreSelect
          label="Pickup interval"
          :firebase-value="slotIntervalMinutes"
          :options="slotIntervalOptions"
          :disabled="disabled"
          disabled-message="This menu is read-only."
          :update-function="updateSlotInterval"
        />

        <MoleculesFormsFirestoreSimpleField
          label="Scheduling horizon (days)"
          type="number"
          :firebase-value="scheduleHorizonDays"
          placeholder="7"
          :maxlength="2"
          :disabled="disabled"
          disabled-message="This menu is read-only."
          :validation-function="validateScheduleHorizon"
          :update-function="updateScheduleHorizon"
        />
      </div>

      <MoleculesFormsFirestoreSimpleField
        label="Customer message"
        type="textarea"
        :rows="2"
        :maxlength="240"
        :firebase-value="message"
        placeholder="Collect from the counter during pickup hours."
        :disabled="disabled"
        disabled-message="This menu is read-only."
        :update-function="updateMessage"
      />

      <div class="grid gap-4 rounded-lg border border-default p-4">
        <MoleculesFormsFirestoreCheckbox
          label="Collection service hours"
          display-label="Hours source"
          checkbox-label="Use Menu service hours"
          true-label="Menu hours"
          false-label="Custom hours"
          :firebase-value="inheritMenuHours"
          :disabled="disabled"
          disabled-message="This menu is read-only."
          :update-function="updateHoursInheritance"
        />

        <UAlert
          v-if="inheritMenuHours"
          :color="menuHours.windows.length ? 'neutral' : 'warning'"
          variant="soft"
          icon="i-lucide-clock"
          :title="menuHours.windows.length
            ? 'Collection follows Menu service hours'
            : 'Menu service hours are missing'"
          :description="menuHours.windows.length
            ? inheritedHoursSummary
            : 'Add Menu service hours or switch to custom Collection hours.'"
        />

        <MoleculesFormsFirestoreSimpleField
          v-else
          label="Custom Collection hours"
          type="textarea"
          :rows="7"
          :firebase-value="customHoursText"
          placeholder="Tuesday - Saturday 08:00 - 13:00"
          :disabled="disabled"
          disabled-message="This menu is read-only."
          :validation-function="validateCustomHours"
          :update-function="updateCustomHours"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ValidationResult } from 'fireux-core/runtime/composables/fireux/app/forms/useEditableStringField'
import type { MenuOrderTypeConfig } from '../../../../../../models/kitchen/menu/menu.model'
import type { WeekdayTimeWindowsConfig } from '../../../../../../models/shared/weekday-time.model'
import {
  formatWeekdayTimeText,
  parseWeekdayTimeText,
} from '../../../../../../utils/weekday-time'

type UpdateFn = (patch: Partial<MenuOrderTypeConfig>) => Promise<void>

const props = defineProps<{
  config: MenuOrderTypeConfig
  disabled?: boolean
  menuHours: WeekdayTimeWindowsConfig
  updateFunction: UpdateFn
}>()

const slotIntervalOptions = [15, 30, 45, 60].map(value => ({
  label: `${value} minutes`,
  value: String(value),
}))
const asapEnabled = computed(() => props.config.asap_enabled !== false)
const noticeHours = computed(() => props.config.notice_hours ?? 0.5)
const slotIntervalMinutes = computed(() =>
  String(props.config.slot_interval_minutes || 30)
)
const scheduleHorizonDays = computed(() =>
  props.config.schedule_horizon_days || 7
)
const message = computed(() => String(props.config.message || ''))
const inheritMenuHours = computed(() =>
  props.config.service_hours?.inherit_menu_service_hours !== false
)
const customHoursText = computed(() => formatWeekdayTimeText(
  props.config.service_hours?.operation_hours
))
const inheritedHoursSummary = computed(() => formatWeekdayTimeText(props.menuHours))

const validNumber = (
  value: string,
  minimum: number,
  maximum: number,
  label: string
): ValidationResult => {
  const number = Number(value)

  return Number.isFinite(number) && number >= minimum && number <= maximum
    ? { isValid: true }
    : { isValid: false, message: `${label} must be between ${minimum} and ${maximum}.` }
}
const validateNoticeHours = (value: string) =>
  validNumber(value, 0.25, 168, 'Minimum notice')
const validateScheduleHorizon = (value: string) =>
  validNumber(value, 1, 30, 'Scheduling horizon')
const validateCustomHours = (value: string): ValidationResult => {
  try {
    const hours = parseWeekdayTimeText(value, props.menuHours.timezone)
    return hours.windows.length
      ? { isValid: true }
      : { isValid: false, message: 'Add at least one Collection-hours range.' }
  } catch (error) {
    return {
      isValid: false,
      message: error instanceof Error ? error.message : 'Collection hours are invalid.',
    }
  }
}

const updateAsapEnabled = (value: boolean) =>
  props.updateFunction({ asap_enabled: value })
const updateNoticeHours = (value: string) =>
  props.updateFunction({ notice_hours: Number(value) })
const updateSlotInterval = (value: string) =>
  props.updateFunction({ slot_interval_minutes: Number(value) })
const updateScheduleHorizon = (value: string) =>
  props.updateFunction({ schedule_horizon_days: Math.round(Number(value)) })
const updateMessage = (value: string) =>
  props.updateFunction({ message: value })
const updateHoursInheritance = (value: boolean) =>
  props.updateFunction({
    service_hours: {
      inherit_menu_service_hours: value,
    },
  })
const updateCustomHours = (value: string) =>
  props.updateFunction({
    service_hours: {
      inherit_menu_service_hours: false,
      operation_hours: parseWeekdayTimeText(value, props.menuHours.timezone),
    },
  })
</script>
