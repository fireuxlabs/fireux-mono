<template>
  <Teleport to="#kitchen-orders-actions">
    <div class="orders-toolbar__actions">
      <UBadge color="success" variant="soft" size="sm">
        Pass {{ passOrders.length }}
      </UBadge>
      <UBadge
        v-if="pass.selectedOrders.value.length"
        color="success"
        variant="subtle"
        size="sm"
      >
        {{ pass.selectedOrders.value.length }} selected
      </UBadge>
      <UButton
        size="sm"
        color="success"
        icon="i-lucide-send"
        :disabled="!pass.canSend.value"
        :loading="pass.sending.value"
        @click="pass.send"
      >
        Send
      </UButton>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useKitchenOrdersWorkspace } from '../../../../../composables/fireux/console/kitchen/operations/Orders/useKitchenOrdersWorkspace'

defineOptions({ name: 'ConsoleKitchenOperationsOrdersToolbar' })

const { passOrders, pass } = useKitchenOrdersWorkspace()
</script>

<style scoped>
.orders-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
