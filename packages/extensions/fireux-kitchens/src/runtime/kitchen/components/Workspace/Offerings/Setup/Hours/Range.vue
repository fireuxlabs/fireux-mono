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
    <MoleculesMultiSelect
      label="Serving days"
      :items="days"
      :model-value="value.days"
      :disabled="disabled"
      @update:model-value="setDays"
    />
    <div class="grid grid-cols-2 gap-3">
      <UFormField label="From">
        <UInput
          type="time"
          variant="soft"
          :ui="{ base: 'rounded-full px-4 py-2 ring-1 ring-inset ring-default' }"
          :model-value="value.open"
          class="w-full"
          :disabled="disabled"
          @update:model-value="setTime('open', $event)"
        />
      </UFormField>
      <UFormField label="Until">
        <UInput
          type="time"
          variant="soft"
          :ui="{ base: 'rounded-full px-4 py-2 ring-1 ring-inset ring-default' }"
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
