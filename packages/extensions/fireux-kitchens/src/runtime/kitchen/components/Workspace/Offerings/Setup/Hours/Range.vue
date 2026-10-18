<template>
  <fieldset
    :aria-label="'Time range ' + number"
    class="space-y-3 py-3 first:pt-0"
  >
    <div class="flex items-center justify-between gap-3">
      <span class="text-sm font-medium">Days</span>
      <UButton
        icon="i-lucide-trash-2"
        :aria-label="'Remove time range ' + number"
        color="neutral"
        variant="ghost"
        size="xs"
        :disabled="disabled"
        @click="emit('remove')"
      />
    </div>
    <div class="grid grid-cols-7 gap-1" role="group" aria-label="Serving days">
      <UButton
        v-for="day in weekdayTimeDayOptions"
        :key="day.value"
        :label="day.label.slice(0, 3)"
        :aria-label="day.label"
        :aria-pressed="value.days.includes(day.value)"
        :color="value.days.includes(day.value) ? 'primary' : 'neutral'"
        :variant="value.days.includes(day.value) ? 'solid' : 'soft'"
        :disabled="disabled"
        class="min-h-10 min-w-0 justify-center px-0 text-xs"
        @click="toggleDay(day.value)"
      />
    </div>
    <div class="grid grid-cols-2 gap-3">
      <UFormField label="From">
        <UInput
          type="time"
          :model-value="value.open"
          class="w-full"
          :disabled="disabled"
          @update:model-value="setTime('open', $event)"
        />
      </UFormField>
      <UFormField label="Until">
        <UInput
          type="time"
          :model-value="value.close"
          class="w-full"
          :disabled="disabled"
          @update:model-value="setTime('close', $event)"
        />
      </UFormField>
    </div>
    <p
      v-if="value.open && value.close && value.close <= value.open"
      class="text-xs text-muted"
    >
      {{
        value.close === value.open
          ? '24-hour service, ending the next day.'
          : 'Ends the next day.'
      }}
    </p>
  </fieldset>
</template>
<script setup lang="ts">
import type {
  WeekdayTimeWindow,
  WeekdayTimeDay,
} from '../../../../../../models/shared/weekday-time.model'
import {
  weekdayTimeDayOptions,
  weekdayTimeDays,
} from '../../../../../../utils/weekday-time'
const props = defineProps<{
  value: WeekdayTimeWindow
  number: number
  disabled?: boolean
}>()
const emit = defineEmits<{ update: [value: WeekdayTimeWindow]; remove: [] }>()
function toggleDay(day: WeekdayTimeDay) {
  const selected = new Set(props.value.days)
  if (selected.has(day)) selected.delete(day)
  else selected.add(day)
  emit('update', {
    ...props.value,
    days: weekdayTimeDays.filter((value) => selected.has(value)),
  })
}
function setTime(key: 'open' | 'close', value: string | number) {
  emit('update', { ...props.value, [key]: String(value) })
}
</script>
