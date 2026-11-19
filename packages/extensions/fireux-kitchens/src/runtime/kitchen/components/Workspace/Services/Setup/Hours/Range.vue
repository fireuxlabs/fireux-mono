<template>
  <fieldset :aria-label="'Time range ' + number">
    <div>
      <span>Days</span>
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
    <FireMultiSelect
      label="Serving days"
      :items="days"
      :model-value="value.days"
      :disabled="disabled"
      @update:model-value="setDays"
    />
    <div>
      <UFormField label="From">
        <UInput
          type="time"
          variant="soft"
          :model-value="value.open"
          :disabled="disabled"
          @update:model-value="setTime('open', $event)"
        />
      </UFormField>
      <UFormField label="Until">
        <UInput
          type="time"
          variant="soft"
          :model-value="value.close"
          :disabled="disabled"
          @update:model-value="setTime('close', $event)"
        />
      </UFormField>
    </div>
    <p v-if="value.open && value.close && value.close <= value.open">
      {{
        value.close === value.open
          ? '24-hour service, ending the next day.'
          : 'Ends the next day.'
      }}
    </p>
  </fieldset>
</template>
<script setup lang="ts">
import type { WeekdayTimeWindow } from '../../../../../../models/shared/weekday-time.model'
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
const days = weekdayTimeDayOptions.map((day) => ({
  label: day.label.slice(0, 3),
  value: day.value,
  description: day.label,
}))
function setDays(values: string[]) {
  const selected = new Set(values)
  emit('update', {
    ...props.value,
    days: weekdayTimeDays.filter((day) => selected.has(day)),
  })
}
function setTime(key: 'open' | 'close', value: string | number) {
  emit('update', { ...props.value, [key]: String(value) })
}
</script>
