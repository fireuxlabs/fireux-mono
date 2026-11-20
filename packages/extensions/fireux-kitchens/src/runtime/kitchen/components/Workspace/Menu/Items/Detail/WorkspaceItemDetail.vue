<template>
  <section class="workspace-item-basics">
    <div class="workspace-item-basics__copy">
      <h2 class="workspace-item-basics__name">
        {{ item.name || 'Untitled item' }}
      </h2>
      <p v-if="item.description" class="workspace-item-basics__description">
        {{ item.description }}
      </p>
    </div>
    <ItemPhoto
      v-if="item.image"
      class="workspace-item-basics__photo"
      :src="item.image"
      :alt="item.name || 'Item'"
    />
  </section>
</template>

<script setup lang="ts">
import ItemPhoto from '../Photo.vue'
import type { Item } from '../../../../../records/menus/items/item'

defineProps<{ item: Pick<Item, 'name' | 'description' | 'image'> }>()
</script>

<style scoped>
.workspace-item-basics {
  max-inline-size: 48rem;
  margin-block-start: calc(var(--spacing) * 6);
  display: grid;
  align-items: start;
  gap: calc(var(--spacing) * 6);
}

.workspace-item-basics__copy {
  min-inline-size: 0;
  max-inline-size: 50ch;
}

.workspace-item-basics__name {
  margin: 0;
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.workspace-item-basics__description {
  margin: calc(var(--spacing) * 3) 0 0;
  color: var(--ui-text-muted);
  line-height: 1.6;
  overflow-wrap: anywhere;
  white-space: pre-line;
}

.workspace-item-basics > .workspace-item-basics__photo {
  inline-size: 100%;
  max-inline-size: 24rem;
  aspect-ratio: 4 / 3;
}

@media (min-width: 48rem) {
  .workspace-item-basics:has(> .workspace-item-basics__photo) {
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  }
}
</style>
