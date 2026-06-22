<template>
  <section :class="['manifest-section', { 'manifest-section--order': orderMode }]">
    <h2>{{ section.label }}</h2>

    <MenuStructuredItem
      v-for="item in section.items"
      :key="item.id"
      :item="item"
      :order-mode="orderMode"
      :quantity="quantities?.[item.id] || 0"
      @add="$emit('add', $event)"
      @remove="$emit('remove', $event)"
    />
  </section>
</template>

<script setup lang="ts">
import type {
  MenuStructuredItem,
  MenuStructuredSection,
} from './types'

defineProps<{
  section: MenuStructuredSection
  orderMode?: boolean
  quantities?: Record<string, number>
}>()

defineEmits<{
  (event: 'add', item: MenuStructuredItem): void
  (event: 'remove', item: MenuStructuredItem): void
}>()
</script>

<style scoped>
.manifest-section {
  display: grid;
  gap: 0.7rem;
  align-content: start;
}

.manifest-section h2 {
  display: grid;
  grid-template-columns: auto minmax(2rem, 1fr);
  gap: 0.75rem;
  align-items: center;
  margin: 0;
  color: var(--menu-title);
  font-size: clamp(1.05rem, 1.6vw, 1.25rem);
  font-weight: 900;
  letter-spacing: 0.18em;
  line-height: 1.2;
  text-transform: uppercase;
}

.manifest-section h2::after {
  content: "";
  display: block;
  height: 2px;
  background: color-mix(in srgb, var(--menu-title) 38%, transparent);
}

.manifest-section--order {
  gap: 0.45rem;
}

.manifest-section--order h2 {
  font-size: clamp(0.9rem, 1.2vw, 1.05rem);
  letter-spacing: 0.14em;
}

@media (min-width: 920px) {
  .manifest-section {
    break-inside: avoid;
    margin-bottom: 2rem;
  }

  .manifest-section--order {
    margin-bottom: 0;
  }
}
</style>
