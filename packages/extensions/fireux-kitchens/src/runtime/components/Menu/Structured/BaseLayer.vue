<template>
  <div
    class="menu-base-layer"
    :class="{ 'menu-base-layer--dimmed': view.dimmed }"
  >
    <MenuStructuredHeader
      :model-value="view.selectedChoice"
      :menu="view.menu"
      :choices="view.choices"
      @update:model-value="$emit('update:selectedChoice', $event)"
    />

    <MenuFunnelNotice
      v-if="view.orderMode && view.orderNotice"
      :message="view.orderNotice"
    />

    <MenuStructuredSectionNav
      v-if="view.orderMode && view.menu.content.sections.length > 1"
      :sections="view.menu.content.sections"
    />

    <MenuStructuredSections
      :sections="view.menu.content.sections"
      :order-mode="view.orderMode"
      :quantities="view.quantities"
      @add="$emit('add', $event)"
      @remove="$emit('remove', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type {
  MenuChoiceValue,
  MenuStructuredBaseLayerView,
  MenuStructuredOrderItem,
} from './types'

defineProps<{
  view: MenuStructuredBaseLayerView
}>()

defineEmits<{
  (event: 'update:selectedChoice', value: MenuChoiceValue): void
  (event: 'add', item: MenuStructuredOrderItem): void
  (event: 'remove', item: MenuStructuredOrderItem): void
}>()
</script>

<style scoped>
.menu-base-layer {
  display: grid;
  gap: clamp(2rem, 4vw, 3rem);
  transition:
    filter 180ms ease,
    opacity 180ms ease;
}

.menu-base-layer--dimmed {
  filter: saturate(0.72);
  opacity: 0.38;
  pointer-events: none;
}
</style>
