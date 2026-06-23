<template>
  <div class="menu-sections">
    <MenuStructuredSection
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
  MenuStructuredItem,
  MenuStructuredSection,
} from './types'

const props = defineProps<{
  sections: MenuStructuredSection[]
  orderMode?: boolean
  quantities?: Record<string, number>
}>()

defineEmits<{
  (event: 'add', item: MenuStructuredItem): void
  (event: 'remove', item: MenuStructuredItem): void
}>()

const sectionDomId = (id: string) =>
  `menu-section-${String(id || '').replace(/[^a-zA-Z0-9_-]/g, '-')}`
</script>

<style scoped>
.menu-sections {
  display: grid;
  gap: 2rem;
  width: min(88rem, 100%);
  margin: 0 auto;
  text-align: left;
}

@media (min-width: 920px) {
  .menu-sections {
    display: block;
    column-count: 2;
    column-gap: clamp(2rem, 4vw, 4rem);
  }
}
</style>
