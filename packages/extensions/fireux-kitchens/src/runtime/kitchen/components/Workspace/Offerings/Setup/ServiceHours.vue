<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between gap-3">
      <h3 class="text-xs font-medium uppercase tracking-wide text-muted">Hours</h3>
      <UButton
        :label="editing ? 'Done' : 'Edit hours'"
        :aria-expanded="editing"
        size="xs"
        color="neutral"
        variant="ghost"
        :disabled="disabled"
        @click="editing = !editing"
      />
    </div>
    <div v-if="!editing" class="space-y-1">
      <p class="text-xs text-muted">{{ sameAsKitchen ? 'Kitchen hours' : 'Custom hours' }}</p>
      <p v-for="line in summary" :key="line" class="text-sm">{{ line }}</p>
      <p v-if="!summary.length" class="text-sm text-warning">No serving hours set</p>
    </div>
    <template v-else>
      <UFormField label="Same as Kitchen service hours?">
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
    </template>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { WeekdayTimeWindowsConfig } from '../../../../../models/shared/weekday-time.model'
import { serviceHoursSummary } from '../../../../utils/service-hours'
const props = defineProps<{
  sameAsKitchen: boolean
  value?: WeekdayTimeWindowsConfig | null
  kitchenHours?: WeekdayTimeWindowsConfig
  label: string
  timezone: string
  disabled?: boolean
}>()
const editing = ref(false)
const summary = computed(() => {
  const hours = props.sameAsKitchen ? props.kitchenHours : props.value
  return serviceHoursSummary(hours)
})
const emit = defineEmits<{
  inherit: [value: boolean]
  update: [value: WeekdayTimeWindowsConfig | null]
}>()
</script>
