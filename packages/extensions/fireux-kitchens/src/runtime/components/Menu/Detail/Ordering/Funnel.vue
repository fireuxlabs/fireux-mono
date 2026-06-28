<template>
  <div
    class="menu-order-funnel"
    :class="{
      'menu-order-funnel--panel': order.panelOpen,
      'menu-order-funnel--status': order.awaitingAcceptance || order.sentOrder,
    }"
  >
    <MenuDetailOrderingStatus
      v-if="order.awaitingAcceptance || order.sentOrder"
      :order="order"
      @clear="$emit('clear')"
    />

    <MenuDetailOrderingBasket
      v-else-if="!order.panelOpen"
      :quantity="order.quantity"
      :pending="order.pending"
      :action-label="order.actionLabel"
      @place="$emit('openPanel')"
    />

    <MenuDetailOrderingFunnelPanel
      v-else
      :order-type="order.orderType"
      :menu-id="order.menuId"
      :kitchen-slug="order.kitchenSlug"
      :policy="order.policy"
      :pending="order.pending"
      :selection="order.selection"
      @close="$emit('closePanel')"
      @submit="$emit('submit', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type {
  MenuOrderingFunnelState,
  MenuOrderingSubmitPayload,
} from './types'

defineProps<{
  order: MenuOrderingFunnelState
}>()

defineEmits<{
  (event: 'clear'): void
  (event: 'closePanel'): void
  (event: 'openPanel'): void
  (event: 'submit', payload: MenuOrderingSubmitPayload): void
}>()
</script>

<style scoped>
.menu-order-funnel {
  position: fixed;
  z-index: 30;
  right: max(1rem, env(safe-area-inset-right));
  bottom: max(1rem, env(safe-area-inset-bottom));
  left: auto;
  display: grid;
  justify-items: end;
  padding: 0;
  pointer-events: none;
}

.menu-order-funnel > * {
  pointer-events: auto;
}

.menu-order-funnel--panel,
.menu-order-funnel--status {
  inset: 0;
  justify-items: center;
  padding:
    max(0.75rem, env(safe-area-inset-top))
    max(0.75rem, env(safe-area-inset-right))
    max(0.75rem, env(safe-area-inset-bottom))
    max(0.75rem, env(safe-area-inset-left));
  background: color-mix(in srgb, var(--menu-bg) 68%, transparent);
  pointer-events: auto;
}

.menu-order-funnel--panel {
  align-items: stretch;
}

.menu-order-funnel--status {
  align-items: center;
}
</style>
