<template>
  <section
    class="structured-menu"
    :class="{ 'structured-menu--dimmed': view?.dimmed }"
  >
    <p v-if="pending" class="menu-state">
      Loading menu...
    </p>

    <p v-else-if="error" class="menu-state">
      Menu unavailable.
    </p>

    <article v-else-if="view" class="menu">
      <MenuDetailStructuredHeader
        :model-value="view.selectedChoice"
        :menu="view.menu"
        :choices="view.choices"
        @update:model-value="$emit('update:selectedChoice', $event)"
      />

      <MenuDetailStructuredSectionNav
        v-if="view.orderMode && view.menu.content.sections.length > 1"
        :sections="view.menu.content.sections"
      />

      <MenuDetailSectionList
        :sections="view.menu.content.sections"
        :order-mode="view.orderMode"
        :quantities="view.quantities"
        @add="$emit('add', $event)"
        @remove="$emit('remove', $event)"
      />
    </article>

    <p v-else class="menu-state">
      Menu unavailable.
    </p>
  </section>
</template>

<script setup lang="ts">
import type {
  MenuChoiceValue,
  MenuStructuredOrderItem,
  MenuStructuredView,
} from './types'

defineProps<{
  view: MenuStructuredView | null
  pending?: boolean
  error?: unknown
}>()

defineEmits<{
  (event: 'update:selectedChoice', value: MenuChoiceValue): void
  (event: 'add', item: MenuStructuredOrderItem): void
  (event: 'remove', item: MenuStructuredOrderItem): void
}>()
</script>

<style scoped>
.structured-menu {
  display: grid;
  gap: clamp(1rem, 3vw, 2rem);
  color: var(--menu-text);
  text-align: center;
  transition:
    filter 180ms ease,
    opacity 180ms ease;
}

.structured-menu--dimmed {
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
