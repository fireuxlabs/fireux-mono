<template>
  <button
    type="button"
    class="menu-order-basket"
    :disabled="order.pending"
    :aria-label="order.actionLabel"
    @click="$emit('open')"
  >
    <UIcon name="i-lucide-shopping-basket" aria-hidden="true" />
  </button>
</template>

<script setup lang="ts">
import type { MenuOrderingFunnelState } from '../../../../models/kitchen/menu/menu-ordering.model'

defineProps<{
  order: MenuOrderingFunnelState
}>()

defineEmits<{
  (event: 'open'): void
}>()
</script>
