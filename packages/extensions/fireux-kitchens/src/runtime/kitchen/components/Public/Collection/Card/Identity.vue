<template>
  <NuxtLink :to="cell.to" class="kitchen-discovery-identity">
    <img
      v-if="cell.image"
      :src="cell.image"
      :alt="cell.title"
      loading="lazy"
      class="kitchen-discovery-identity__image"
    />
    <div v-else class="kitchen-discovery-identity__fallback">
      <UIcon name="i-lucide-utensils" />
    </div>
    <div class="kitchen-discovery-identity__text">
      <h3 class="fx-type-card-heading">{{ cell.title }}</h3>
      <p v-if="cell.meta" class="fx-type-caption">{{ cell.meta }}</p>
      <p v-if="cell.description">{{ cell.description }}</p>
    </div>
  </NuxtLink>
</template>
<script setup lang="ts">
import type { CollectionCellData } from 'fireux-core/runtime/types/collection-cell'
defineProps<{ cell: CollectionCellData }>()
</script>
<style scoped>
.kitchen-discovery-identity {
  display: block;
  color: inherit;
}
.kitchen-discovery-identity__image,
.kitchen-discovery-identity__fallback {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  background: var(--ui-bg-muted);
}
.kitchen-discovery-identity__fallback {
  display: grid;
  place-items: center;
}
.kitchen-discovery-identity__text {
  display: grid;
  gap: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) * 5);
}
.kitchen-discovery-identity__text p {
  margin: 0;
  color: var(--ui-text-muted);
}
.kitchen-discovery-identity:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: -2px;
}
</style>
