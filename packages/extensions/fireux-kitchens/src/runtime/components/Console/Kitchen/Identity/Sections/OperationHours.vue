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
            Use Google business hours or set kitchen opening times.
          </span>
        </span>
      </span>
    </UButton>

    <template #content>
      <UCard class="mt-4">
        <div class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <UButtonGroup>
              <UButton
                color="neutral"
                :variant="hours.source === 'place' ? 'solid' : 'soft'"
                :disabled="!canWrite || saving || !placeId"
                @click="saveSource('place')"
              >
                Google business hours
              </UButton>

              <UButton
                color="neutral"
                :variant="hours.source === 'custom' ? 'solid' : 'soft'"
                :disabled="!canWrite || saving"
                @click="saveSource('custom')"
              >
                Set kitchen hours
              </UButton>
            </UButtonGroup>

            <UBadge color="neutral" variant="soft">
              {{ hours.timezone }}
            </UBadge>
          </div>

          <div
            v-if="hours.source === 'place'"
            class="space-y-3 rounded-lg border border-default p-4"
          >
            <p class="text-sm text-dimmed">
              This kitchen is using the linked Place business hours from Google.
              Set kitchen hours when ordering hours differ from public opening
              hours.
            </p>

            <PlaceGoogleHours
              v-if="placeId"
              :place-id="placeId"
              auto-load
              button-label="Refresh Google hours"
            />
            <p
              v-else
              class="text-sm text-dimmed"
            >
              Link this kitchen to a Place before inheriting Place hours.
            </p>
          </div>

          <MoleculesFormsFirestoreObjectArray
            v-else
            label="Kitchen opening times"
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
                Add time window
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
import PlaceGoogleHours from 'fireux-places/runtime/components/Place/GoogleHours.vue'
import { computed, ref } from 'vue'
import { useKitchenUpdate } from '../../../../../composables/fireux/firestore/kitchen/mutations/useKitchenUpdate'
import type {
  WeekdayTimeDay,
  WeekdayTimeWindow,
  WeekdayTimeWindowsConfig,
  WeekdayTimeWindowsSource,
} from '../../../../../models/shared/weekday-time.model'
import {
  weekdayTimeDayOptions,
  weekdayTimeWindowFromRange,
} from '../../../../../utils/weekday-time'
import { readKitchenOperationHours } from '../../../../../utils/kitchen-spine'

const props = defineProps<{
  kitchen: Record<string, unknown> | null
  kitchenId: string
  collectionPath: string
  canWrite: boolean
}>()

const collectionPath = computed(() => props.collectionPath)
const { updateKitchen } = useKitchenUpdate({ collectionPath })
const toast = useToastify()
const error = ref('')
const saving = ref(false)
const hours = computed(() => readKitchenOperationHours(props.kitchen))
const placeId = computed(() => String(props.kitchen?.place_id ?? '').trim())
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
      source: 'custom',
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

async function saveSource(source: WeekdayTimeWindowsSource) {
  if (!props.canWrite || saving.value || source === hours.value.source) return
  if (source === 'place' && !placeId.value) return
  if (!props.kitchenId) throw new Error('No kitchen selected.')

  saving.value = true
  try {
    await updateKitchen(props.kitchenId, {
      'orders.operation_hours': {
        ...hours.value,
        source,
      },
    })
    toast.add({
      title: source === 'place' ? 'Using Google business hours' : 'Using kitchen hours',
      color: 'success',
      icon: 'i-lucide-check',
    })
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : 'Please try again.'
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
