<template>
  <div class="menu-order-funnel" aria-label="Order basket">
    <button
      type="button"
      class="menu-order-basket"
      :disabled="funnel.order.pending"
      :aria-label="funnel.order.actionLabel"
      @click="funnel.open"
    >
      <UIcon name="i-lucide-shopping-basket" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup lang="ts">
import type { MenuOrderingFunnelController } from '../../../../models/kitchen/menu/menu-ordering.model'

defineProps<{
  funnel: MenuOrderingFunnelController
}>()
</script>
