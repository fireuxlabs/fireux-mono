<template>
  <section
    v-if="
      menu &&
      menu.schedule !== 'daily' &&
      menu.format !== 'document' &&
      !menu.doc?.url
    "
    class="space-y-4 border-t border-default py-4"
  >
    <h2 class="text-lg font-semibold">Menu availability</h2>
    <p class="text-sm text-muted">
      These times apply wherever this Menu is used. Each service can narrow them
      further.
    </p>
    <URadioGroup
      :model-value="custom ? 'custom' : 'service'"
      :items="[
        { value: 'service', label: 'Throughout its services' },
        { value: 'custom', label: 'Specific times' },
      ]"
      :disabled="!canWrite || busy || !timezone"
      @update:model-value="setMode($event === 'custom')"
    />
    <div class="space-y-1 text-sm text-muted">
      <p class="font-medium">Within Kitchen service hours</p>
      <p v-for="line in serviceHoursSummary(kitchenHours)" :key="line">
        {{ line }}
      </p>
      <p v-if="!kitchenHours.windows.length">
        Set venue and Kitchen hours first.
      </p>
    </div>
    <UAlert
      v-if="conflict"
      color="warning"
      title="Menu hours need adjusting"
      description="The Kitchen schedule has changed. This Menu is only available where its times overlap the Kitchen and service windows."
    />
    <KitchenFoodAndDrinkServicesSetupHours
      v-if="custom"
      label="Menu serving hours"
      :value="hours"
      :timezone="timezone"
      :disabled="!canWrite || busy"
      @update="setHours"
    />
    <p v-if="busy" role="status" class="text-sm text-muted">Updating…</p>
    <UAlert
      v-if="error"
      color="error"
      title="Menu hours could not be updated"
      :description="error"
    />
  </section>
</template>
<script setup lang="ts">
import { computed, onScopeDispose, ref, watch } from 'vue'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import type { WeekdayTimeWindowsConfig } from '../../../../../models/shared/weekday-time.model'
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
import {
  hoursWithinParent,
  serviceHoursSummary,
} from '../../../../utils/service-hours'
const {
  menu,
  menuId,
  kitchenId,
  kitchenHours,
  timezone,
  canWrite,
  updateMenu,
} = useKitchenMenuRecordContext()
const custom = ref(false)
const hours = ref<WeekdayTimeWindowsConfig | null>(null)
const busy = ref(false)
const error = ref('')
let timer: ReturnType<typeof setTimeout> | undefined
const capture = useCommandScope([kitchenId, menuId, canWrite])
const conflict = computed(() =>
  Boolean(
    custom.value &&
      hours.value?.windows.length &&
      !hoursWithinParent(hours.value, kitchenHours.value)
  )
)
watch(
  () => menu.value?.serving_hours,
  (value) => {
    if (busy.value || timer) return
    custom.value = Boolean(value)
    hours.value = value || null
  },
  { immediate: true, deep: true }
)
watch([kitchenId, menuId, canWrite], () => {
  clearTimeout(timer)
  timer = undefined
  busy.value = false
  error.value = ''
})
onScopeDispose(() => clearTimeout(timer))
const empty = (): WeekdayTimeWindowsConfig => ({
  source: 'custom',
  timezone: timezone.value,
  windows: [],
})
async function persist(value: WeekdayTimeWindowsConfig | null) {
  if (!canWrite.value || busy.value) return
  const current = capture(),
    kitchen = kitchenId.value,
    id = menuId.value
  busy.value = true
  error.value = ''
  try {
    await updateMenu(kitchen, id, { serving_hours: value })
  } catch (cause) {
    if (current()) {
      error.value = cause instanceof Error ? cause.message : 'Please try again.'
      custom.value = Boolean(menu.value?.serving_hours)
      hours.value = menu.value?.serving_hours || null
    }
  } finally {
    if (current()) busy.value = false
  }
}
function setMode(value: boolean) {
  clearTimeout(timer)
  timer = undefined
  custom.value = value
  hours.value = value ? empty() : null
  void persist(hours.value)
}
function setHours(value: WeekdayTimeWindowsConfig | null) {
  hours.value = value || empty()
  clearTimeout(timer)
  const current = capture(),
    next = hours.value
  timer = setTimeout(() => {
    timer = undefined
    if (current()) void persist(next)
  }, 500)
}
</script>
