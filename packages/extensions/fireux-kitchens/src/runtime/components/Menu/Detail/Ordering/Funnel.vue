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
