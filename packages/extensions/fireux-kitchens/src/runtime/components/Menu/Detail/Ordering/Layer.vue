<template>
  <div
    class="menu-order-layer"
    :class="{
      'menu-order-layer--funnel': order.funnelOpen,
      'menu-order-layer--status': order.awaitingAcceptance || order.sentOrder,
    }"
  >
    <MenuDetailOrderingStatus
      v-if="order.awaitingAcceptance || order.sentOrder"
      :order="order"
      @clear="$emit('clear')"
    />

    <MenuDetailOrderingBasket
      v-else-if="!order.funnelOpen"
      :quantity="order.quantity"
      :pending="order.pending"
      :action-label="order.actionLabel"
      @place="$emit('openFunnel')"
    />

    <MenuDetailOrderingFunnelPanel
      v-else
      :order-type="order.orderType"
      :menu-id="order.menuId"
      :kitchen-slug="order.kitchenSlug"
      :policy="order.policy"
      :pending="order.pending"
      :selection="order.selection"
      @close="$emit('closeFunnel')"
      @submit="$emit('submit', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type {
  MenuOrderingLayerState,
  MenuOrderingSubmitPayload,
} from './types'

defineProps<{
  order: MenuOrderingLayerState
}>()

defineEmits<{
  (event: 'clear'): void
  (event: 'closeFunnel'): void
  (event: 'openFunnel'): void
  (event: 'submit', payload: MenuOrderingSubmitPayload): void
}>()
</script>

<style scoped>
.menu-order-layer {
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

.menu-order-layer > * {
  pointer-events: auto;
}

.menu-order-layer--funnel,
.menu-order-layer--status {
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

.menu-order-layer--funnel {
  align-items: stretch;
}

.menu-order-layer--status {
  align-items: center;
}
</style>
