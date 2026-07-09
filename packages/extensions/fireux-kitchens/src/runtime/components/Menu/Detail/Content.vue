<template>
  <section
    class="menu-detail-content"
    :class="{ 'menu-detail-content--dimmed': view?.dimmed }"
  >
    <article v-if="view" class="menu">
      <MenuDetailHeader
        :model-value="view.selectedChoice"
        :menu="view.menu"
        :choices="view.choices"
        :pre-order-operator-status="preOrderOperatorStatus"
        :surface-options="view.surfaceOptions"
        :surface-label="view.surfaceLabel"
        @update:model-value="$emit('update:selectedChoice', $event)"
      />

      <MenuDetailContentSectionNav
        v-if="view.menu.content.sections.length > 1"
        :sections="view.menu.content.sections"
      />

      <MenuDetailContentSectionList
        :sections="view.menu.content.sections"
        :order-mode="view.orderMode"
        :selected-item-id="view.selectedItemId"
        @select-item="$emit('selectItem', $event)"
        @add="$emit('add', $event)"
      />
    </article>

    <p v-else class="menu-state">
      Menu unavailable.
    </p>
  </section>
</template>

<script setup lang="ts">
import type {
  MenuDetailItem,
  MenuDetailOrderItem,
  MenuDetailView,
  MenuChoiceValue,
} from '../../../composables/fireux/kitchen/order/funnel/shared/useFunnel'
import type { MenuOrderingOperatorPresence } from '../../../models/kitchen/menu/menu-ordering.model'

defineProps<{
  view: MenuDetailView | null
  preOrderOperatorStatus?: MenuOrderingOperatorPresence['status']
}>()

defineEmits<{
  (event: 'update:selectedChoice', value: MenuChoiceValue): void
  (event: 'selectItem', item: MenuDetailItem): void
  (event: 'add', item: MenuDetailOrderItem): void
}>()
</script>

<style scoped>
.menu-detail-content {
  display: grid;
  gap: clamp(1rem, 3vw, 2rem);
  color: var(--menu-text);
  text-align: center;
  transition:
    filter 180ms ease,
    opacity 180ms ease;
}

.menu-detail-content--dimmed {
  filter: saturate(0.72);
  opacity: 0.38;
  pointer-events: none;
}

.menu {
  display: grid;
  gap: clamp(2rem, 4vw, 3rem);
}

.menu-state {
  margin: 0;
  color: var(--menu-muted);
  font-size: 0.95rem;
  font-weight: 700;
}
</style>
