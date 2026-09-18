<template>
  <UCard v-if="config.enabled">
    <div class="grid gap-5">
      <MoleculesFormsEditableCheckbox
        label="Pause new orders"
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
        :placeholder="
          serviceLabel + ' is temporarily paused. Please try again later.'
        "
        :disabled="disabled"
        :update="updatePauseMessage"
      />
    </div>
  </UCard>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenOrderTypeConfig } from '../../../models/ordering.model'
import type { KitchenServiceInteractionChanges } from '../../../models/service.model'
const props = defineProps<{
  config: KitchenOrderTypeConfig & { enabled: boolean }
  disabled?: boolean
  serviceLabel: string
  updateFunction: (patch: KitchenServiceInteractionChanges) => Promise<void>
}>()
const paused = computed(() => props.config.availability?.paused === true)
const pauseMessage = computed(() => props.config.availability?.message || '')
const updatePaused = (paused: boolean) =>
  props.updateFunction({ availability: { paused } })
const updatePauseMessage = (message: string) =>
  props.updateFunction({ availability: { message } })
</script>
