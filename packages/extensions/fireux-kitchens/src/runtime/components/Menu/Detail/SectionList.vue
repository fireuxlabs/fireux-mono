<template>
  <div class="menu-sections">
    <MenuDetailSection
      v-for="section in sections"
      :key="section.id"
      :id="sectionDomId(section.id)"
      :section="section"
      :order-mode="orderMode"
      :quantities="quantities"
      @add="$emit('add', $event)"
      @remove="$emit('remove', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type {
  MenuFoodOrderItem,
  MenuFoodSection as MenuFoodSectionModel,
} from '../../../models/kitchen/menu/menu-food.model'

const props = defineProps<{
  sections: MenuFoodSectionModel[]
  orderMode?: boolean
  quantities?: Record<string, number>
}>()

defineEmits<{
  (event: 'add', item: MenuFoodOrderItem): void
  (event: 'remove', item: MenuFoodOrderItem): void
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
    column-gap: clamp(var(--menu-space-lg), 4vw, 4rem);
  }
}
</style>
