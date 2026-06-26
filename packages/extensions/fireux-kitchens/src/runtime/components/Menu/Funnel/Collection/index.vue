<template>
  <div class="menu-order-funnel">
    <p>Collection funnel placeholder</p>
  </div>
</template>

<script setup lang="ts">
import type { MenuOrderTypeConfig } from '../../../../models/menu/menu.model'
import type { KitchenOrderCustomer } from '../../../../models/order.model'

withDefaults(
  defineProps<{
    modelValue: KitchenOrderCustomer
    policy?: MenuOrderTypeConfig
  }>(),
  {
    policy: undefined,
  }
)

defineEmits<{
  (event: 'update:modelValue', value: KitchenOrderCustomer): void
}>()
</script>

<style scoped>
.menu-order-funnel {
  display: grid;
  gap: 1rem;
}

.menu-order-funnel p {
  margin: 0;
  color: var(--menu-muted);
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.45;
}
</style>
