<template>
  <UCard class="workspace-item-basics">
    <template #header>
      <h2 class="workspace-item-basics__title">Workspace item</h2>
    </template>
    <dl class="workspace-item-basics__fields">
      <div>
        <dt>Name</dt>
        <dd>{{ item.name || 'Untitled item' }}</dd>
      </div>
      <div>
        <dt>Description</dt>
        <dd>{{ item.description || 'No description' }}</dd>
      </div>
      <div v-if="item.image">
        <dt>Photo</dt>
        <dd>
          <ItemPhoto
            class="workspace-item-basics__photo"
            :src="item.image"
            :alt="item.name || 'Item'"
          />
        </dd>
      </div>
    </dl>
  </UCard>
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
}

.workspace-item-basics__title {
  margin: 0;
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
}

.workspace-item-basics__fields {
  display: grid;
  gap: calc(var(--spacing) * 4);
  margin: 0;
}

.workspace-item-basics__fields > div {
  display: grid;
  grid-template-columns: 8rem minmax(0, 1fr);
  gap: calc(var(--spacing) * 2);
}

.workspace-item-basics__fields dt {
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}

.workspace-item-basics__fields dd {
  margin: 0;
  overflow-wrap: anywhere;
  white-space: pre-line;
}

.workspace-item-basics__photo {
  inline-size: 7rem;
  max-inline-size: 100%;
}

@media (max-width: 480px) {
  .workspace-item-basics__fields > div {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--spacing);
  }
}
</style>
