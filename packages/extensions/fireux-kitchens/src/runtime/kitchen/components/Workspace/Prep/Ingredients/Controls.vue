<template>
  <WorkspaceKitchenCollectionToolbar
    v-model="query"
    label="ingredients"
    singular="ingredient"
    :count="visibleCount"
  >
    <template #controls>
      <div role="group" aria-label="Ingredient layout">
        <UButton
          v-for="view in views"
          :key="view.value"
          :icon="view.icon"
          :aria-label="view.label"
          :aria-pressed="layout === view.value"
          color="neutral"
          :variant="layout === view.value ? 'soft' : 'ghost'"
          @click="layout = view.value"
        />
      </div>
    </template>
    <template #filters>
      <USelect
        v-model="category"
        :items="categoryNavigation"
        value-key="value"
        label-key="label"
        aria-label="Ingredient category"
      />
      <USelect
        v-model="imageFilter"
        :items="imageOptions"
        aria-label="Filter ingredient images"
      />
      <UButton
        v-if="hasFilters"
        label="Clear filters"
        color="neutral"
        variant="ghost"
        @click="clearFilters"
      />
    </template>
  </WorkspaceKitchenCollectionToolbar>
</template>

<script setup lang="ts">
import { requireIngredientCatalogue } from './useCatalogue'

const {
  query,
  category,
  imageFilter,
  layout,
  visibleCount,
  categoryNavigation,
  hasFilters,
  clearFilters,
} = requireIngredientCatalogue()
const views = [
  { value: 'grid' as const, label: 'Grid view', icon: 'i-lucide-layout-grid' },
  { value: 'list' as const, label: 'List view', icon: 'i-lucide-list' },
]
const imageOptions = [
  { label: 'All images', value: 'all' },
  { label: 'Images missing', value: 'missing' },
]
</script>
