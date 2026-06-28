<template>
  <section class="structured-menu">
    <p v-if="pending" class="menu-state">
      Loading menu...
    </p>

    <p v-else-if="error" class="menu-state">
      Menu unavailable.
    </p>

    <article v-else-if="view" class="menu">
      <MenuDetailStructuredBaseLayer
        :view="view"
        @update:selected-choice="$emit('update:selectedChoice', $event)"
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
  MenuStructuredBaseLayerView,
  MenuStructuredOrderItem,
} from './types'

defineProps<{
  view: MenuStructuredBaseLayerView | null
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
