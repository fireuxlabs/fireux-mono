<template>
  <section class="space-y-3">
    <UFormField label="Hours">
      <p class="mb-2 text-xs text-muted">Same as Kitchen service hours?</p>
      <URadioGroup
        :model-value="sameAsKitchen ? 'yes' : 'no'"
        :items="[
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' },
        ]"
        orientation="horizontal"
        :disabled="disabled"
        @update:model-value="emit('inherit', $event === 'yes')"
      />
    </UFormField>
    <WorkspaceKitchenOfferingsSetupHours
      v-if="!sameAsKitchen"
      :value="value"
      :label="label"
      :timezone="timezone"
      :disabled="disabled"
      @update="emit('update', $event)"
    />
  </section>
</template>
<script setup lang="ts">
import type { WeekdayTimeWindowsConfig } from '../../../../../models/shared/weekday-time.model'
defineProps<{
  sameAsKitchen: boolean
  value?: WeekdayTimeWindowsConfig | null
  label: string
  timezone: string
  disabled?: boolean
}>()
const emit = defineEmits<{
  inherit: [value: boolean]
  update: [value: WeekdayTimeWindowsConfig | null]
}>()
</script>
