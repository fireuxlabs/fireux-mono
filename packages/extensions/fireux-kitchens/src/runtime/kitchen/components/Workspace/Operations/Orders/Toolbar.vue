<template>
  <!-- 2026-07-19 14:55 CEST: Keep this Teleport client-only; SSR leaves the navbar target empty and otherwise hydrates mismatched children. -->
  <ClientOnly>
    <Teleport to="#kitchen-orders-actions">
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
          Send
        </UButton>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useKitchenOrdersWorkspace } from '../../../../composables/workspace/operations/Orders/useKitchenOrdersWorkspace'

defineOptions({ name: 'WorkspaceKitchenOperationsOrdersToolbar' })

const { passOrders, pass } = useKitchenOrdersWorkspace()
const { canSend, selectedOrders, send, sending } = pass
</script>

<style scoped>
.orders-toolbar__actions {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
}
</style>
