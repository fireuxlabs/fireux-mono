<template>
  <UCard v-if="config.enabled">
    <div class="grid gap-5">
      <MoleculesFormsEditableCheckbox
        :capture-intent="captureIntent"
        label="Pause new orders"
        checkbox-label="Pause new orders"
        true-label="Paused"
        false-label="Not paused"
        :value="paused"
        :disabled="disabled"
        :update="updatePaused"
      />
      <MoleculesFormsEditableSimpleField
        :capture-intent="captureIntent"
        v-if="paused"
        label="Pause message"
        type="textarea"
        :rows="2"
        :maxlength="240"
        :value="pauseMessage"
        :placeholder="
          interactionLabel + ' is temporarily paused. Please try again later.'
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
import type { KitchenOfferingInteractionChanges } from '../../../models/offering.model'
const props = defineProps<{
  config: KitchenOrderTypeConfig & { enabled: boolean }
  disabled?: boolean
  captureIntent?: () => () => boolean
  interactionLabel: string
  updateFunction: (
    patch: KitchenOfferingInteractionChanges,
    isSurfaceCurrent?: () => boolean
  ) => Promise<void>
}>()
const paused = computed(() => props.config.availability?.paused === true)
const pauseMessage = computed(() => props.config.availability?.message || '')
const updatePaused = (paused: boolean, isSurfaceCurrent?: () => boolean) =>
  props.updateFunction({ availability: { paused } }, isSurfaceCurrent)
const updatePauseMessage = (
  message: string,
  isSurfaceCurrent?: () => boolean
) => props.updateFunction({ availability: { message } }, isSurfaceCurrent)
</script>
