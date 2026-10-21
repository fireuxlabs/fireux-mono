<template>
  <section class="space-y-3">
    <div>
      <h3 class="text-sm font-medium">{{ label }}</h3>
      <p v-if="!timezone" class="text-xs text-muted">
        Set the venue timezone in Identity first.
      </p>
    </div>
    <p v-if="ranges.length" class="text-xs font-medium text-muted">
      Time range
    </p>
    <div class="divide-y divide-default">
      <KitchenFoodAndDrinkServicesSetupHoursRange
        v-for="(range, index) in ranges"
        :key="range.key"
        :value="range.value"
        :number="index + 1"
        :disabled="disabled || !timezone"
        @update="update(index, $event)"
        @remove="remove(index)"
      />
    </div>
    <p v-if="incomplete" class="text-xs text-muted" role="status">
      Choose days and both times to update these hours.
    </p>
    <p v-else-if="!ranges.length" class="text-sm text-muted">
      No serving times set.
    </p>
    <UButton
      :label="ranges.length ? 'Add another time range' : 'Add time range'"
      icon="i-lucide-plus"
      color="neutral"
      variant="soft"
      size="sm"
      :disabled="disabled || !timezone || ranges.length >= 100"
      @click="add"
    />
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type {
  WeekdayTimeWindow,
  WeekdayTimeWindowsConfig,
} from '../../../../../models/shared/weekday-time.model'
import { requireOperatingHours } from '../../../../utils/operating-hours'
const props = defineProps<{
  label: string
  value?: WeekdayTimeWindowsConfig | null
  timezone: string
  disabled?: boolean
}>()
const emit = defineEmits<{ update: [value: WeekdayTimeWindowsConfig | null] }>()
let nextKey = 0
let lastSent = ''
const dirty = ref(false)
const ranges = ref<Array<{ key: number; value: WeekdayTimeWindow }>>([])
watch(
  () => props.value,
  (value) => {
    if (dirty.value || JSON.stringify(value) === lastSent) return
    lastSent = JSON.stringify(value ?? null)
    ranges.value = (value?.windows || []).map((value) => ({
      key: nextKey++,
      value: { ...value, days: [...value.days] },
    }))
  },
  { immediate: true, deep: true }
)
const configuration = computed(() => {
  if (!ranges.value.length) return null
  try {
    return requireOperatingHours({
      source: 'custom',
      timezone: props.timezone,
      windows: ranges.value.map((range) => range.value),
    })
  } catch {
    return undefined
  }
})
const incomplete = computed(
  () => ranges.value.length > 0 && configuration.value === undefined
)
function publish() {
  if (props.disabled || !props.timezone || configuration.value === undefined)
    return
  const signature = JSON.stringify(configuration.value)
  if (signature === lastSent) {
    dirty.value = false
    return
  }
  lastSent = signature
  dirty.value = false
  emit('update', configuration.value)
}
function add() {
  dirty.value = true
  ranges.value.push({
    key: nextKey++,
    value: { days: [], open: '', close: '' },
  })
}
function update(index: number, value: WeekdayTimeWindow) {
  dirty.value = true
  ranges.value[index]!.value = value
  publish()
}
function remove(index: number) {
  dirty.value = true
  ranges.value.splice(index, 1)
  publish()
}
</script>
