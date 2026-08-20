<template>
  <WorkspaceKitchenOperationsOrdersReceivingEstimate
    label="Ready for driver in"
    :accepting="accepting"
    :can-interact="canInteract"
    :minutes="estimateMinutes"
    :order-id="orderId"
    @accept="$emit('accept', $event)"
    @nudge-estimate="$emit('nudge-estimate', $event)"
    @set-estimate="$emit('set-estimate', $event)"
  />
</template>

<script setup lang="ts">
defineOptions({ name: 'WorkspaceKitchenOperationsOrdersReceivingDelivery' })

withDefaults(
  defineProps<{
    accepting?: boolean
    canInteract?: boolean
    estimateMinutes: number
    orderId: string
  }>(),
  {
    accepting: false,
    canInteract: true,
  }
)

defineEmits<{
  (event: 'accept', payload: { id: string; estimatedMinutes: number }): void
  (event: 'nudge-estimate', payload: { id: string; amount: number }): void
  (event: 'set-estimate', payload: { id: string; minutes: number }): void
}>()
</script>
