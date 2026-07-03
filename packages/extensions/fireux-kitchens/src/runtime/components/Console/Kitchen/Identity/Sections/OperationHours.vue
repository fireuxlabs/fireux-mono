<template>
  <UCollapsible>
    <UButton
      class="group"
      color="neutral"
      variant="soft"
      block
      trailing-icon="i-lucide-chevron-down"
      :ui="{
        trailingIcon:
          'group-data-[state=open]:rotate-180 transition-transform duration-200',
      }"
    >
      <span class="flex min-w-0 items-start gap-3 text-left">
        <UIcon
          name="i-lucide-clock-3"
          class="mt-0.5 size-4 shrink-0 text-muted"
        />
        <span class="grid min-w-0">
          <span class="truncate">Operation hours</span>
          <span class="truncate text-xs font-normal text-dimmed">
            Kitchen ordering windows used by menus that inherit hours.
          </span>
        </span>
      </span>
    </UButton>

    <template #content>
      <UCard class="mt-4">
        <template #header>
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div class="text-base font-semibold text-highlighted">
                Kitchen operation hours
              </div>
              <p class="text-sm text-dimmed">
                Add the windows when this kitchen accepts online orders.
              </p>
            </div>

            <UBadge color="neutral" variant="soft">
              {{ hours.timezone }}
            </UBadge>
          </div>
        </template>

        <div class="space-y-4">
          <MoleculesFormsFirestoreObjectArray
            label="Weekly windows"
            :firebase-value="hours.windows"
            :update-function="saveWindows"
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
                  <UInput
                    v-model="item.open"
                    type="time"
                    :disabled="saving"
                  />
                </UFormField>

                <UFormField label="Close">
                  <UInput
                    v-model="item.close"
                    type="time"
                    :disabled="saving"
                  />
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
                Add item
              </UButton>
            </template>
          </MoleculesFormsFirestoreObjectArray>

          <p v-if="error" class="text-sm text-error">
            {{ error }}
          </p>
        </div>
      </UCard>
    </template>
  </UCollapsible>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed, ref } from 'vue'
import { useKitchenUpdate } from '../../../../../composables/fireux/firestore/kitchen/mutations/useKitchenUpdate'
import type {
  WeekdayTimeDay,
  WeekdayTimeWindow,
  WeekdayTimeWindowsConfig,
} from '../../../../../models/shared/weekday-time.model'
import {
  weekdayTimeDayOptions,
  weekdayTimeWindowFromRange,
} from '../../../../../utils/weekday-time'
import { readKitchenOperationHours } from '../../../../../utils/kitchen-spine'

const props = defineProps<{
  kitchen: Record<string, unknown> | null
  kitchenId: string
  canWrite: boolean
}>()

const { updateKitchen } = useKitchenUpdate()
const toast = useToastify()
const error = ref('')
const saving = ref(false)
const hours = computed(() => readKitchenOperationHours(props.kitchen))
const dayOptions = weekdayTimeDayOptions

const defaultWindow = (): WeekdayTimeWindow => ({
  days: ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
  open: '08:00',
  close: '13:00',
})

function readItem(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
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

  return (row.end_day || days[days.length - 1] || startDay(item)) as WeekdayTimeDay
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

  return window
    ? `${window.open} - ${window.close}`
    : 'Operation hours'
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
      .map((day) => dayOptions.find((option) => option.value === day)?.label || day)
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
    const nextHours: WeekdayTimeWindowsConfig = {
      timezone: hours.value.timezone,
      windows,
    }
    if (!props.kitchenId) throw new Error('No kitchen selected.')

    saving.value = true
    await updateKitchen(props.kitchenId, {
      'orders.operation_hours': nextHours,
    })
    toast.add({
      title: 'Operation hours saved',
      color: 'success',
      icon: 'i-lucide-check',
    })
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : 'Please try again.'
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
</script>
