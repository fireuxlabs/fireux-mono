<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between gap-3">
      <h3 class="text-xs font-medium uppercase tracking-wide text-muted">
        Hours
      </h3>
      <UButton
        :icon="editing ? 'i-lucide-check' : 'i-lucide-pencil'"
        :aria-label="editing ? 'Done editing hours' : 'Edit hours'"
        :aria-expanded="editing"
        size="xs"
        color="neutral"
        variant="outline"
        :disabled="disabled"
        @click="editing = !editing"
      />
    </div>
    <div v-if="!editing" class="space-y-1">
      <p class="text-xs text-muted">
        {{ sameAsKitchen ? 'Kitchen hours' : 'Custom hours' }}
      </p>
      <p v-for="line in summary" :key="line" class="text-sm">{{ line }}</p>
      <p v-if="!summary.length" class="text-sm text-warning">
        No serving hours set
      </p>
    </div>
    <UAlert
      v-if="conflict"
      color="warning"
      title="Service hours need adjusting"
      description="These saved times extend beyond Kitchen service hours. Customers can only use the overlapping times."
    />
    <template v-if="editing">
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
      <div class="text-sm text-muted">
        <p class="font-medium">Within Kitchen service hours</p>
        <p v-for="line in serviceHoursSummary(kitchenHours)" :key="line">
          {{ line }}
        </p>
      </div>
      <KitchenFoodAndDrinkServicesSetupHours
        v-if="!sameAsKitchen"
        :value="value"
        :label="label"
        :timezone="timezone"
        :disabled="disabled"
        @update="emit('update', $event)"
      />
      <slot name="menus" :hours="effectiveHours" />
    </template>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { intersectWeekdayHours } from '../../../../../utils/weekday-time-constraints'
import type { WeekdayTimeWindowsConfig } from '../../../../../models/shared/weekday-time.model'
import {
  hoursWithinParent,
  serviceHoursSummary,
} from '../../../../utils/service-hours'
const props = defineProps<{
  sameAsKitchen: boolean
  value?: WeekdayTimeWindowsConfig | null
  kitchenHours?: WeekdayTimeWindowsConfig
  label: string
  timezone: string
  disabled?: boolean
}>()
const editing = ref(false)
const conflict = computed(() =>
  Boolean(
    !props.sameAsKitchen &&
      props.value?.windows.length &&
      props.kitchenHours &&
      !hoursWithinParent(props.value, props.kitchenHours)
  )
)
const effectiveHours = computed(() =>
  props.sameAsKitchen
    ? props.kitchenHours
    : props.value && props.kitchenHours
      ? intersectWeekdayHours(props.value, props.kitchenHours)
      : props.value
)
const summary = computed(() => serviceHoursSummary(effectiveHours.value))
const emit = defineEmits<{
  inherit: [value: boolean]
  update: [value: WeekdayTimeWindowsConfig | null]
}>()
</script>
