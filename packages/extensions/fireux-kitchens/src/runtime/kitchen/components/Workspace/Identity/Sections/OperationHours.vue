<template>
  <!-- Concurrent edit — 2026-07-20 21:17 CEST — Place-root authority pass: edit Kitchen-hour deltas without copying or persisting empty Place inheritance. -->
  <MoleculesDisclosurePanel
    title="Operation hours"
    description="Use linked Place business hours or set a Kitchen-only override."
    icon="i-lucide-clock-3"
  >
    <UCard class="mt-4">
      <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <UButtonGroup>
            <UButton
              color="neutral"
              :variant="usesPlaceHours ? 'solid' : 'soft'"
              :disabled="!canWrite || saving || !placeId"
              @click="saveSource('place')"
            >
              Use Place hours
            </UButton>

            <UButton
              color="neutral"
              :variant="usesPlaceHours ? 'soft' : 'solid'"
              :disabled="!canWrite || saving"
              @click="saveSource('custom')"
            >
              Set kitchen hours
            </UButton>
          </UButtonGroup>

          <UBadge v-if="hours.timezone" color="neutral" variant="soft">
            {{ hours.timezone }}
          </UBadge>
          <UBadge v-else color="warning" variant="soft">
            Timezone needed
          </UBadge>
        </div>

        <div
          v-if="usesPlaceHours"
          class="space-y-3 rounded-lg border border-default p-4"
        >
          <p class="text-sm text-dimmed">
            This Kitchen inherits the linked Place business hours. Set a Kitchen
            override only when its operation differs from the Place baseline.
          </p>

          <ul
            v-if="inheritedHourLines.length"
            class="space-y-1 text-sm text-highlighted"
          >
            <li v-for="line in inheritedHourLines" :key="line">{{ line }}</li>
          </ul>
          <UAlert
            v-else
            color="warning"
            variant="soft"
            title="Place hours unavailable"
            description="Open the linked Place and add its timezone and business hours."
          />

          <UButton
            color="neutral"
            variant="soft"
            icon="i-lucide-map-pin"
            to="/workspace/kitchen/identity/place"
          >
            Configure Place hours
          </UButton>
        </div>

        <MoleculesFormsEditableObjectArray
          v-else
          label="Kitchen opening times"
          :value="hours.windows"
          :update="saveWindows"
          :item-title="operationHoursItemTitle"
          :item-subtitle="operationHoursItemSubtitle"
          :show-actions="canWrite"
          :sort-by-date="false"
        >
          <template #display="{ item }">
            <p class="text-sm text-highlighted">
              {{ operationHoursItemTitle(item) }}
            </p>
            <p class="text-sm text-dimmed">
              {{ operationHoursItemSubtitle(item) }}
            </p>
          </template>

          <template #edit="{ item, save, cancel }">
            <div class="grid gap-3 md:grid-cols-[1fr_1fr_8rem_8rem_auto_auto]">
              <UFormField label="From">
                <USelect
                  :model-value="startDay(item)"
                  :options="dayOptions"
                  :disabled="saving"
                  @update:model-value="setStartDay(item, $event)"
                />
              </UFormField>

              <UFormField label="To">
                <USelect
                  :model-value="endDay(item)"
                  :options="dayOptions"
                  :disabled="saving"
                  @update:model-value="setEndDay(item, $event)"
                />
              </UFormField>

              <UFormField label="Open">
                <UInput v-model="item.open" type="time" :disabled="saving" />
              </UFormField>

              <UFormField label="Close">
                <UInput v-model="item.close" type="time" :disabled="saving" />
              </UFormField>

              <UButton
                class="self-end"
                size="xs"
                color="primary"
                icon="i-lucide-check"
                :loading="saving"
                @click="save()"
              >
                Save
              </UButton>

              <UButton
                class="self-end"
                size="xs"
                color="neutral"
                variant="soft"
                icon="i-lucide-x"
                :disabled="saving"
                @click="cancel()"
              >
                Cancel
              </UButton>
            </div>
          </template>

          <template #create="{ push }">
            <UButton
              v-if="canWrite"
              type="button"
              size="sm"
              variant="soft"
              icon="i-lucide-plus"
              :disabled="saving"
              @click="push(defaultWindow())"
            >
              Add time window
            </UButton>
          </template>
        </MoleculesFormsEditableObjectArray>

        <p v-if="error" class="text-sm text-error">
          {{ error }}
        </p>
      </div>
    </UCard>
  </MoleculesDisclosurePanel>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { readPlaceBusinessHours } from 'fireux-places/runtime/place/utils/place-spine'
import { computed, ref } from 'vue'
import { useKitchenWorkspacePlace } from '../../../../composables/workspace/identity/useKitchenWorkspacePlace'
import { useKitchenUpdate } from '../../../../composables/firestore/useKitchenUpdate'
import type {
  WeekdayTimeDay,
  WeekdayTimeWindow,
  WeekdayTimeWindowsConfig,
  WeekdayTimeWindowsSource,
} from '../../../../../models/shared/weekday-time.model.ts'
import {
  weekdayTimeDayOptions,
  weekdayTimeLines,
  weekdayTimeWindowFromRange,
} from '../../../../../utils/weekday-time'
import {
  hasKitchenOperationHours,
  readKitchenOperationHours,
  resolveKitchenOperationHours,
} from '../../../../utils/kitchen-readers'

const props = defineProps<{
  kitchen: Record<string, unknown> | null
  kitchenId: string
  collectionPath: string
  canWrite: boolean
}>()

const { place } = useKitchenWorkspacePlace()
const { updateKitchen } = useKitchenUpdate()
const toast = useToastify()
const error = ref('')
const saving = ref(false)
const customEditorOpen = ref(false)
const effectiveHours = computed(() =>
  resolveKitchenOperationHours(props.kitchen, place.value)
)
const storedKitchenHours = computed(() => readKitchenOperationHours(props.kitchen))
const hasStoredCustomHours = computed(
  () =>
    hasKitchenOperationHours(props.kitchen) &&
    storedKitchenHours.value.source === 'custom' &&
    storedKitchenHours.value.windows.length > 0
)
const usesPlaceHours = computed(() => !customEditorOpen.value && !hasStoredCustomHours.value)
const hours = computed(() => {
  if (usesPlaceHours.value) return effectiveHours.value
  if (hasStoredCustomHours.value) return storedKitchenHours.value

  return {
    source: 'custom' as const,
    timezone: effectiveHours.value.timezone,
    windows: [],
  }
})
const placeId = computed(() => String(props.kitchen?.id ?? '').trim())
const inheritedHourLines = computed(() => {
  const configured = readPlaceBusinessHours(place.value)
  return configured
    ? weekdayTimeLines({ source: 'place', ...configured })
    : weekdayTimeLines(hours.value)
})
const dayOptions = weekdayTimeDayOptions

const defaultWindow = (): WeekdayTimeWindow => ({
  days: ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
  open: '08:00',
  close: '13:00',
})

function readItem(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function startDay(item: unknown): WeekdayTimeDay {
  const row = readItem(item)
  const days = Array.isArray(row.days) ? row.days : []

  return (row.start_day || days[0] || 'tuesday') as WeekdayTimeDay
}

function endDay(item: unknown): WeekdayTimeDay {
  const row = readItem(item)
  const days = Array.isArray(row.days) ? row.days : []

  return (row.end_day ||
    days[days.length - 1] ||
    startDay(item)) as WeekdayTimeDay
}

function setStartDay(item: unknown, value: unknown) {
  readItem(item).start_day = String(value || 'tuesday')
}

function setEndDay(item: unknown, value: unknown) {
  readItem(item).end_day = String(value || 'saturday')
}

function operationHoursItemTitle(item: unknown) {
  const row = readItem(item)
  const window = weekdayTimeWindowFromRange(
    startDay(row),
    endDay(row),
    row.open,
    row.close
  )

  return window ? `${window.open} - ${window.close}` : 'Operation hours'
}

function operationHoursItemSubtitle(item: unknown) {
  const row = readItem(item)
  const window = weekdayTimeWindowFromRange(
    startDay(row),
    endDay(row),
    row.open,
    row.close
  )

  return window
    ? window.days
        .map(
          (day) =>
            dayOptions.find((option) => option.value === day)?.label || day
        )
        .join(', ')
    : 'Choose days and times.'
}

async function saveWindows(items: unknown[]) {
  if (!props.canWrite) return
  try {
    error.value = ''
    const windows = items.map((item, index) => {
      const row = readItem(item)
      const window = weekdayTimeWindowFromRange(
        startDay(row),
        endDay(row),
        row.open,
        row.close
      )
      if (!window) {
        throw new Error(`Item ${index + 1} needs valid days and times.`)
      }

      return window
    })
    if (!props.kitchenId) throw new Error('No kitchen selected.')
    if (windows.length && !hours.value.timezone) {
      throw new Error(
        'Set the linked Place timezone before saving Kitchen hours.'
      )
    }

    saving.value = true
    await updateKitchen({
      kitchenId: props.kitchenId,
      changes: {
        'orders.operation_hours': windows.length
          ? ({
              source: 'custom',
              timezone: hours.value.timezone,
              windows,
            } satisfies WeekdayTimeWindowsConfig)
          : (null as never),
      },
    })
    customEditorOpen.value = windows.length > 0
    toast.add({
      title: windows.length
        ? 'Operation hours saved'
        : 'Using Place business hours',
      color: 'success',
      icon: 'i-lucide-check',
    })
  } catch (caught) {
    const message =
      caught instanceof Error ? caught.message : 'Please try again.'
    toast.add({
      title: 'Could not save operation hours',
      description: message,
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
    error.value = message
    throw caught
  } finally {
    saving.value = false
  }
}

async function saveSource(source: WeekdayTimeWindowsSource) {
  if (!props.canWrite || saving.value) return
  if (source === 'place' && !placeId.value) return
  if (!props.kitchenId) throw new Error('No kitchen selected.')
  if (source === 'place' && usesPlaceHours.value) return
  if (source === 'custom') {
    customEditorOpen.value = true
    return
  }

  saving.value = true
  try {
    await updateKitchen({
      kitchenId: props.kitchenId,
      changes: { 'orders.operation_hours': null as never },
    })
    customEditorOpen.value = false
    toast.add({
      title: 'Using Place business hours',
      color: 'success',
      icon: 'i-lucide-check',
    })
  } catch (caught) {
    const message =
      caught instanceof Error ? caught.message : 'Please try again.'
    toast.add({
      title: 'Could not update operation hours source',
      description: message,
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
    throw caught
  } finally {
    saving.value = false
  }
}
</script>
