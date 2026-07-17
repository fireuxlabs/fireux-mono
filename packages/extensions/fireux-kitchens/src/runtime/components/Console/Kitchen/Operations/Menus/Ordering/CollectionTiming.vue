<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 class="text-sm font-semibold text-highlighted">
            Collection timing
          </h3>
          <p class="text-sm text-dimmed">
            Define when customers can collect and which pickup times they can choose.
          </p>
        </div>

        <UBadge
          :color="config.service_hours ? 'success' : 'warning'"
          variant="soft"
        >
          {{ config.service_hours ? 'Configured' : 'Needs configuration' }}
        </UBadge>
      </div>
    </template>

    <div class="space-y-5">
      <div class="grid gap-4 md:grid-cols-2">
        <UFormField label="Immediate collection">
          <USwitch
            v-model="draft.asapEnabled"
            :disabled="disabled"
            label="Allow ‘As soon as possible’ while collection is open"
          />
        </UFormField>

        <UFormField label="Minimum notice" help="Applied to scheduled pickup times.">
          <div class="flex items-center gap-2">
            <UInput
              v-model="draft.noticeHours"
              type="number"
              min="0.25"
              max="168"
              step="0.25"
              :disabled="disabled"
              @blur="queueSave(0)"
            />
            <span class="text-sm text-dimmed">hours</span>
          </div>
        </UFormField>

        <UFormField label="Pickup interval">
          <USelect
            v-model="draft.slotIntervalMinutes"
            :items="slotIntervalOptions"
            value-key="value"
            :disabled="disabled"
          />
        </UFormField>

        <UFormField label="Scheduling horizon">
          <div class="flex items-center gap-2">
            <UInput
              v-model="draft.scheduleHorizonDays"
              type="number"
              min="1"
              max="30"
              step="1"
              :disabled="disabled"
              @blur="queueSave(0)"
            />
            <span class="text-sm text-dimmed">days</span>
          </div>
        </UFormField>
      </div>

      <UFormField label="Customer message">
        <UTextarea
          v-model="draft.message"
          :rows="2"
          :maxlength="240"
          placeholder="Collect from the counter during pickup hours."
          :disabled="disabled"
          @blur="queueSave(0)"
        />
      </UFormField>

      <div class="space-y-3 rounded-lg border border-default p-4">
        <USwitch
          v-model="draft.inheritMenuHours"
          :disabled="disabled"
          label="Use Menu service hours"
        />

        <UAlert
          v-if="draft.inheritMenuHours"
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

        <UFormField
          v-else
          label="Custom collection hours"
          help='One range per line, for example “Tuesday - Saturday 08:00 - 13:00”.'
        >
          <UTextarea
            v-model="draft.hoursText"
            :rows="7"
            placeholder="Tuesday - Saturday 08:00 - 13:00"
            :disabled="disabled"
            @blur="queueSave(0)"
          />
        </UFormField>
      </div>

      <p v-if="validationError" class="text-sm text-error" role="alert">
        {{ validationError }}
      </p>

    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import type { MenuOrderTypeConfig } from '../../../../../../models/kitchen/menu/menu.model'
import type { WeekdayTimeWindowsConfig } from '../../../../../../models/shared/weekday-time.model'
import {
  formatWeekdayTimeText,
  parseWeekdayTimeText,
} from '../../../../../../utils/weekday-time'

const props = defineProps<{
  config: MenuOrderTypeConfig
  disabled?: boolean
  menuHours: WeekdayTimeWindowsConfig
}>()

const emit = defineEmits<{
  (event: 'save', config: MenuOrderTypeConfig): void
}>()

type TimingDraft = {
  asapEnabled: boolean
  hoursText: string
  inheritMenuHours: boolean
  message: string
  noticeHours: string | number
  scheduleHorizonDays: string | number
  slotIntervalMinutes: number
}

const draft = reactive<TimingDraft>({
  asapEnabled: true,
  hoursText: '',
  inheritMenuHours: true,
  message: '',
  noticeHours: 0.5,
  scheduleHorizonDays: 7,
  slotIntervalMinutes: 30,
})
const validationError = ref('')
let syncingDraft = false
let saveTimer: ReturnType<typeof setTimeout> | undefined
const slotIntervalOptions = [15, 30, 45, 60].map(value => ({
  label: `${value} minutes`,
  value,
}))
const inheritedHoursSummary = computed(() =>
  formatWeekdayTimeText(props.menuHours)
)

watch(
  () => [props.config, props.menuHours] as const,
  () => {
    syncingDraft = true
    const serviceHours = props.config.service_hours
    draft.asapEnabled = props.config.asap_enabled !== false
    draft.hoursText = formatWeekdayTimeText(
      serviceHours?.operation_hours || props.menuHours
    )
    draft.inheritMenuHours =
      serviceHours?.inherit_menu_service_hours !== false
    draft.message = String(props.config.message || '')
    draft.noticeHours = props.config.notice_hours || 0.5
    draft.scheduleHorizonDays = props.config.schedule_horizon_days || 7
    draft.slotIntervalMinutes = props.config.slot_interval_minutes || 30
    validationError.value = ''
    queueMicrotask(() => {
      syncingDraft = false
    })
  },
  { immediate: true, deep: true }
)

watch(
  draft,
  () => {
    if (!syncingDraft) queueSave()
  },
  { deep: true }
)

function boundedNumber(
  value: unknown,
  minimum: number,
  maximum: number,
  label: string
) {
  const number = Number(value)
  if (!Number.isFinite(number) || number < minimum || number > maximum) {
    throw new Error(`${label} must be between ${minimum} and ${maximum}.`)
  }

  return number
}

function queueSave(delay = 450) {
  if (props.disabled || syncingDraft) return
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(save, delay)
}

function save() {
  validationError.value = ''

  try {
    const noticeHours = boundedNumber(
      draft.noticeHours,
      0.25,
      168,
      'Minimum notice'
    )
    const scheduleHorizonDays = Math.round(boundedNumber(
      draft.scheduleHorizonDays,
      1,
      30,
      'Scheduling horizon'
    ))
    const slotIntervalMinutes = Number(draft.slotIntervalMinutes)
    if (![15, 30, 45, 60].includes(slotIntervalMinutes)) {
      throw new Error('Pickup interval must be 15, 30, 45, or 60 minutes.')
    }

    const customHours = draft.inheritMenuHours
      ? null
      : parseWeekdayTimeText(draft.hoursText, props.menuHours.timezone)
    if (customHours && !customHours.windows.length) {
      throw new Error('Add at least one custom collection-hours range.')
    }
    if (draft.inheritMenuHours && !props.menuHours.windows.length) {
      throw new Error(
        'Menu service hours are missing. Add them or use custom Collection hours.'
      )
    }

    emit('save', {
      ...props.config,
      notice_hours: noticeHours,
      message: draft.message.trim(),
      asap_enabled: draft.asapEnabled,
      slot_interval_minutes: slotIntervalMinutes,
      schedule_horizon_days: scheduleHorizonDays,
      service_hours: {
        inherit_menu_service_hours: draft.inheritMenuHours,
        ...(customHours ? { operation_hours: customHours } : {}),
      },
    })
  } catch (error) {
    validationError.value = error instanceof Error
      ? error.message
      : 'Collection timing is invalid.'
  }
}

onBeforeUnmount(() => {
  if (saveTimer) clearTimeout(saveTimer)
})
</script>
