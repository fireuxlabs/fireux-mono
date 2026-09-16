<template>
  <div class="menu-order-basket-list">
    <h2 class="menu-order-screen-title">Basket</h2>

    <ul class="menu-order-items">
      <li v-for="item in items" :key="item.lineId || item.id">
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
import type { MenuOrderPreviewState } from '../../../models/menu-order-preview.model.ts'
import { useMenuPreviewBasket } from '../../../composables/preview/useMenuPreviewBasket'

const props = defineProps<{
  order: MenuOrderPreviewState
}>()
const { items, lineTotal, totalLabel } = useMenuPreviewBasket(() => props.order)
</script>
