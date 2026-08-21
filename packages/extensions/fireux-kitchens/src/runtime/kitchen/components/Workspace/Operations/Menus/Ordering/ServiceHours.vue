<!-- Concurrent edit — 2026-07-20 21:54 CEST — Place-root authority pass: keep inherited Kitchen hours out of custom Menu overrides. -->
<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">
            Menu service hours
          </h2>
          <p class="text-sm text-dimmed">
            The default hours inherited by Collection and other Menu surfaces.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <UBadge v-if="saveState" color="neutral" variant="soft">
            {{ saveState }}
          </UBadge>
          <UBadge
            :color="menuServiceHours.windows.length ? 'success' : 'warning'"
            variant="soft"
          >
            {{ sourceLabel }}
          </UBadge>
        </div>
      </div>
    </template>

    <div class="space-y-5">
      <USwitch
        v-model="draft.inheritKitchenHours"
        :disabled="!canWrite"
        label="Use Kitchen operation hours"
      />

      <UAlert
        v-if="draft.inheritKitchenHours"
        :color="kitchenOperationHours.windows.length ? 'neutral' : 'warning'"
        variant="soft"
        icon="i-lucide-clock"
        :title="
          kitchenOperationHours.windows.length
            ? 'Inherited from Kitchen operation hours'
            : 'Kitchen operation hours are missing'
        "
        :description="
          kitchenOperationHours.windows.length
            ? kitchenHoursSummary
            : 'Set Kitchen operation hours or use custom Menu hours.'
        "
      />

      <UFormField
        v-else
        label="Custom Menu hours"
        help="One range per line, for example “Tuesday - Saturday 08:00 - 13:00”."
      >
        <UTextarea
          v-model="draft.hoursText"
          :rows="7"
          placeholder="Tuesday - Saturday 08:00 - 13:00"
          :disabled="!canWrite"
          @blur="queueSave(0)"
        />
      </UFormField>

      <p v-if="validationError" class="text-sm text-error" role="alert">
        {{ validationError }}
      </p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useKitchenWorkspaceMenuOrdering } from '../../../../../composables/workspace/operations/Menus/useKitchenWorkspaceMenuOrdering'
import {
  formatWeekdayTimeText,
  parseWeekdayTimeText,
} from '../../../../../../utils/weekday-time'

const {
  canWrite,
  kitchenOperationHours,
  menuServiceHours,
  ordering,
  saveMenuServiceHours,
} = useKitchenWorkspaceMenuOrdering()
const saving = ref(false)
const saveState = ref('')
const validationError = ref('')
let syncingDraft = false
let saveTimer: ReturnType<typeof setTimeout> | undefined
let pendingSave = false
const draft = reactive({
  hoursText: '',
  inheritKitchenHours: true,
})
const kitchenHoursSummary = computed(() =>
  formatWeekdayTimeText(kitchenOperationHours.value)
)
const customHours = computed(() => {
  const serviceHours = ordering.value.service_hours

  return serviceHours?.inherit_kitchen_operation_hours === true
    ? null
    : serviceHours?.operation_hours || null
})
const sourceLabel = computed(() =>
  customHours.value?.windows.length
    ? 'Custom hours'
    : kitchenOperationHours.value.windows.length
      ? 'Kitchen hours'
      : 'Needs configuration'
)

watch(
  () => [ordering.value.service_hours, menuServiceHours.value] as const,
  () => {
    syncingDraft = true
    draft.inheritKitchenHours = !customHours.value?.windows.length
    draft.hoursText = customHours.value
      ? formatWeekdayTimeText(customHours.value)
      : ''
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

function queueSave(delay = 450) {
  if (!canWrite.value || syncingDraft) return
  if (saveTimer) clearTimeout(saveTimer)
  saveState.value = 'Pending changes'
  saveTimer = setTimeout(() => {
    pendingSave = true
    void flushSave()
  }, delay)
}

async function flushSave() {
  if (saving.value || !pendingSave) return
  pendingSave = false
  validationError.value = ''

  try {
    if (
      draft.inheritKitchenHours &&
      !kitchenOperationHours.value.windows.length
    ) {
      throw new Error(
        'Kitchen operation hours are missing. Add them or use custom Menu hours.'
      )
    }

    const customHours = draft.inheritKitchenHours
      ? null
      : parseWeekdayTimeText(
          draft.hoursText,
          kitchenOperationHours.value.timezone
        )
    if (customHours && !customHours.windows.length) {
      throw new Error('Add at least one custom Menu-hours range.')
    }

    saving.value = true
    saveState.value = 'Saving...'
    await saveMenuServiceHours({
      inherit_kitchen_operation_hours: draft.inheritKitchenHours,
      ...(customHours ? { operation_hours: customHours } : {}),
    })
    saveState.value = 'Saved'
  } catch (error) {
    saveState.value = 'Save failed'
    validationError.value =
      error instanceof Error ? error.message : 'Menu service hours are invalid.'
  } finally {
    saving.value = false
    if (pendingSave) void flushSave()
  }
}

onBeforeUnmount(() => {
  if (saveTimer) clearTimeout(saveTimer)
})
</script>
