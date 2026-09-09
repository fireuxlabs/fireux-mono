<template>
  <div class="menu-sections">
    <MenuDetailContentSection
      v-for="section in sections"
      :key="section.id"
      :id="sectionDomId(section.id)"
      :section="section"
      :order-mode="orderMode"
      :selected-item-id="selectedItemId"
      @select-item="$emit('selectItem', $event)"
      @add="$emit('add', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { MenuFoodSection as MenuFoodSectionModel } from '../../../models/menu-food.model.ts'
import type {
  MenuDetailItem,
  MenuDetailOrderItem,
} from '../../../../kitchen/composables/order/funnel/useFunnel'

const props = defineProps<{
  sections: MenuFoodSectionModel[]
  orderMode?: boolean
  selectedItemId?: string
}>()

defineEmits<{
  (event: 'selectItem', item: MenuDetailItem): void
  (event: 'add', item: MenuDetailOrderItem): void
}>()

const sectionDomId = (id: string) =>
  `menu-section-${String(id || '').replace(/[^a-zA-Z0-9_-]/g, '-')}`
</script>

<style scoped>
.menu-sections {
  display: grid;
  gap: var(--menu-space-lg);
  width: min(88rem, 100%);
  margin: 0 auto;
  text-align: left;
}

@media (min-width: 920px) {
  .menu-sections {
    display: block;
    column-count: 2;
    column-gap: clamp(var(--menu-space-lg), 4vw, calc(var(--spacing) * 16));
  }
}
</style>
