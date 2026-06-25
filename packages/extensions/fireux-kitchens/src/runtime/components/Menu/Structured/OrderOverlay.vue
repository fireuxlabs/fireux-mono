<template>
  <div class="menu-order-overlay">
    <MenuSelectionBasket
      v-if="!order.funnelOpen"
      :quantity="order.quantity"
      :items="order.items"
      :pending="order.pending"
      :action-label="order.actionLabel"
      @clear="$emit('clear')"
      @place="$emit('openFunnel')"
    />

    <MenuFunnelPanel
      v-else
      :order-type="order.orderType"
      :policy="order.policy"
      :pending="order.pending"
      :selection="order.selection"
      @close="$emit('closeFunnel')"
      @submit="$emit('submit', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { KitchenOrderCustomer } from '../../../models/order.model'
import type { MenuStructuredOrderOverlayState } from './types'

defineProps<{
  order: MenuStructuredOrderOverlayState
}>()

defineEmits<{
  (event: 'clear'): void
  (event: 'closeFunnel'): void
  (event: 'openFunnel'): void
  (event: 'submit', customer: KitchenOrderCustomer): void
}>()
</script>

<style scoped>
.menu-order-overlay {
  position: fixed;
  z-index: 30;
  right: 0;
  bottom: max(1rem, env(safe-area-inset-bottom));
  left: 0;
  display: grid;
  justify-items: center;
  padding-inline: 0.5rem;
  pointer-events: none;
}

.menu-order-overlay > * {
  pointer-events: auto;
}
</style>
