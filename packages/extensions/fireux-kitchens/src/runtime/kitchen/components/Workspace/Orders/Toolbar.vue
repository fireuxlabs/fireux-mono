<template>
  <div v-if="passOrders.length" class="orders-toolbar__actions">
    <UBadge color="success" variant="soft" size="sm">
      Pass {{ passOrders.length }}
    </UBadge>
    <UBadge
      v-if="selectedOrders.length"
      color="success"
      variant="subtle"
      size="sm"
    >
      {{ selectedOrders.length }} selected
    </UBadge>
    <UButton
      size="sm"
      color="success"
      icon="i-lucide-send"
      :disabled="!canSend"
      :loading="sending"
      @click="send"
    >
      Handed off
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { useKitchenOrdersContext } from '../../../composables/workspace/orders/useKitchenOrdersContext'

defineOptions({ name: 'WorkspaceKitchenOrdersToolbar' })

const { passOrders, pass } = useKitchenOrdersContext()
const { canSend, selectedOrders, send, sending } = pass
</script>

<style scoped>
.orders-toolbar__actions {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
}
</style>
