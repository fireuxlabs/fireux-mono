<template>
  <div class="menu-order-funnel" aria-label="Order basket">
    <button
      type="button"
      class="menu-order-basket"
      :disabled="funnel.order.pending"
      :aria-label="summaryLabel"
      @click="funnel.open"
    >
      <span class="menu-order-basket__icon" aria-hidden="true">
        <UIcon name="i-lucide-shopping-basket" />
      </span>

      <span class="menu-order-basket__copy">
        <span class="menu-order-basket__label">Basket</span>
        <span class="menu-order-basket__count">{{ itemCountLabel }}</span>
      </span>

      <strong class="menu-order-basket__total">{{ totalLabel }}</strong>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBasket } from '../../../../kitchen/composables/order/funnel/shared/useBasket'
import type { MenuOrderingFunnelController } from '../../../models/menu-ordering.model.ts'

const props = defineProps<{
  funnel: MenuOrderingFunnelController
}>()

const { totalLabel } = useBasket(() => props.funnel.order)
const itemCountLabel = computed(() => {
  const quantity = Math.max(0, Number(props.funnel.order.quantity || 0))

  return `${quantity} ${quantity === 1 ? 'item' : 'items'}`
})
const summaryLabel = computed(() =>
  [
    props.funnel.order.actionLabel,
    itemCountLabel.value,
    totalLabel.value,
  ].filter(Boolean).join(', ')
)
</script>
