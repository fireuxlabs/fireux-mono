<template>
  <div class="menu-order-basket-list">
    <p class="menu-order-placeholder">
      Check your items before continuing.
    </p>

    <ul class="menu-order-items">
      <li
        v-for="item in items"
        :key="item.lineId || item.id"
      >
        <span>{{ item.quantity }}x {{ item.name }}</span>
        <strong v-if="lineTotal(item)">{{ lineTotal(item) }}</strong>
      </li>
    </ul>

    <p class="menu-order-total">
      <span>Total</span>
      <strong>{{ totalLabel }}</strong>
    </p>
  </div>
</template>

<script setup lang="ts">
import type { MenuOrderingFunnelState } from '../../../../models/kitchen/menu/menu-ordering.model'
import { useBasket } from '../../../../composables/fireux/kitchen/order/funnel/shared/useBasket'

const props = defineProps<{
  order: MenuOrderingFunnelState
}>()
const {
  items,
  lineTotal,
  totalLabel,
} = useBasket(() => props.order)
</script>
