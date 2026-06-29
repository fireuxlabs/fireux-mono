<template>
  <section class="menu-section">
    <h2>{{ section.label }}</h2>

    <MenuDetailItem
      v-for="item in section.items"
      :key="item.id"
      :item="item"
      :order-mode="orderMode"
      :quantities="quantities"
      @add="$emit('add', $event)"
      @remove="$emit('remove', $event)"
    />
  </section>
</template>

<script setup lang="ts">
import type {
  MenuFoodOrderItem,
  MenuFoodSection,
} from '../../../models/menu/menu-food.model'

defineProps<{
  section: MenuFoodSection
  orderMode?: boolean
  quantities?: Record<string, number>
}>()

defineEmits<{
  (event: 'add', item: MenuFoodOrderItem): void
  (event: 'remove', item: MenuFoodOrderItem): void
}>()
</script>

<style scoped>
.menu-section {
  display: grid;
  gap: 0.7rem;
  align-content: start;
}

.menu-section h2 {
  /* Menu theme spine: section labels are accent text, while primary stays for action controls. */
  display: grid;
  grid-template-columns: auto minmax(2rem, 1fr);
  gap: 0.75rem;
  align-items: center;
  margin: 0;
  color: var(--menu-secondary);
  font-size: clamp(1.05rem, 1.6vw, 1.25rem);
  font-weight: 900;
  letter-spacing: 0.18em;
  line-height: 1.2;
  text-transform: uppercase;
}

.menu-section h2::after {
  content: "";
  display: block;
  height: 2px;
  background: color-mix(in srgb, var(--menu-secondary) 48%, transparent);
}

@media (min-width: 920px) {
  .menu-section {
    break-inside: avoid;
    margin-bottom: 2rem;
  }
}
</style>
