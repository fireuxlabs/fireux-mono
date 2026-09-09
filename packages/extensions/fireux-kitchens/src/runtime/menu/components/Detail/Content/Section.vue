<template>
  <section class="menu-section">
    <h2>{{ section.label }}</h2>

    <MenuDetailItem
      v-for="item in section.items"
      :key="item.id"
      :item="item"
      :order-mode="orderMode"
      :selected="selectedItemId === item.id"
      @select="$emit('selectItem', $event)"
      @add="$emit('add', $event)"
    />
  </section>
</template>

<script setup lang="ts">
import type { MenuFoodSection } from '../../../models/menu-food.model.ts'
import type {
  MenuDetailItem,
  MenuDetailOrderItem,
} from '../../../../kitchen/composables/order/funnel/useFunnel'

defineProps<{
  section: MenuFoodSection
  orderMode?: boolean
  selectedItemId?: string
}>()

defineEmits<{
  (event: 'selectItem', item: MenuDetailItem): void
  (event: 'add', item: MenuDetailOrderItem): void
}>()
</script>

<style scoped>
.menu-section {
  display: grid;
  gap: var(--menu-space-sm);
  align-content: start;
}

.menu-section h2 {
  /* Menu theme spine: section labels are accent text, while primary stays for action controls. */
  display: grid;
  grid-template-columns: auto minmax(2rem, 1fr);
  gap: var(--menu-space-sm);
  align-items: center;
  margin: 0;
  color: var(--menu-secondary);
  font-size: clamp(1.05rem, 1.6vw, var(--text-xl));
  font-weight: var(--font-weight-black);
  letter-spacing: 0.18em;
  line-height: 1.2;
  text-transform: uppercase;
}

.menu-section h2::after {
  content: '';
  display: block;
  height: 2px;
  background: color-mix(in srgb, var(--menu-secondary) 48%, transparent);
}

@media (min-width: 920px) {
  .menu-section {
    break-inside: avoid;
    margin-bottom: calc(var(--spacing) * 8);
  }
}
</style>
