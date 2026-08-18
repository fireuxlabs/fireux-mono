<template>
  <ConsoleKitchenOperationsOrdersTicketPresentation
    :order="order"
    :interactive="interactive"
    prominent
    :selected="selected"
    :show-customer-details="false"
    :header-action-label="isPass && selected ? 'Re-Que' : ''"
    :body-action-label="isPass
      ? selected
        ? 'Remove order from send selection'
        : 'Select order to send'
      : ''"
    :status-action-label="isQueue ? 'Ready' : ''"
    :status-action-aria-label="isQueue ? 'Mark order ready' : ''"
    :status-action-pending="statusActionPending"
    @touch-header="$emit('return', $event)"
    @touch-body="$emit('toggle', $event)"
    @touch-status="$emit('ready', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenOrder } from '../../../../models/order.model.ts'

defineOptions({ name: 'ConsoleKitchenOperationsOrdersTicket' })

const props = withDefaults(defineProps<{
  order: KitchenOrder
  stage: 'pass' | 'queue'
  interactive: boolean
  selected?: boolean
  statusActionPending?: boolean
}>(), {
  selected: false,
  statusActionPending: false,
})

defineEmits<{
  ready: [id: string]
  return: [id: string]
  toggle: [id: string]
}>()

const isPass = computed(() => props.stage === 'pass')
const isQueue = computed(() => props.stage === 'queue')
</script>
