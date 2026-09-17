<template>
  <UCard>
    <MoleculesFormsEditableCheckbox
      :label="serviceLabel"
      display-label="Service"
      :checkbox-label="`Enable ${serviceLabel.toLowerCase()}`"
      true-label="Enabled"
      false-label="Off"
      :value="config.enabled"
      :disabled="disabled"
      :update="updateEnabled"
    />
    <UAlert
      v-if="!config.enabled"
      color="neutral"
      variant="subtle"
      :title="`${serviceLabel} is off`"
      description="Menus remain available to browse."
      class="mt-4"
    />
    <div v-else class="grid gap-5 mt-5">
      <MoleculesFormsEditableCheckbox
        label="Pause new orders"
        display-label="Temporary pause"
        checkbox-label="Pause new orders"
        true-label="Paused"
        false-label="Not paused"
        :value="paused"
        :disabled="disabled"
        :update="updatePaused"
      />
      <MoleculesFormsEditableSimpleField
        v-if="paused"
        label="Pause message"
        type="textarea"
        :rows="2"
        :maxlength="240"
        :value="pauseMessage"
        :placeholder="defaultPauseMessage"
        :disabled="disabled"
        :update="updatePauseMessage"
      />
    </div>
  </UCard>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenOrderingService } from '../../../models/ordering.model'
const props = defineProps<{
  config: KitchenOrderingService
  disabled?: boolean
  serviceLabel: string
  updateFunction: (patch: Partial<KitchenOrderingService>) => Promise<void>
}>()
const paused = computed(() => props.config.availability?.paused === true)
const pauseMessage = computed(() => props.config.availability?.message || '')
const defaultPauseMessage = computed(
  () => `${props.serviceLabel} is temporarily paused. Please try again later.`
)
const updateEnabled = (enabled: boolean) => props.updateFunction({ enabled })
const updatePaused = (paused: boolean) =>
  props.updateFunction({ availability: { paused } })
const updatePauseMessage = (message: string) =>
  props.updateFunction({ availability: { message } })
</script>
