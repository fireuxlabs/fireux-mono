<template>
  <WorkspaceKitchenCollectionHeader title="Items">
    <template #actions>
      <UButton
        label="Kitchen AI"
        icon="i-lucide-sparkles"
        color="neutral"
        variant="soft"
        @click="emit('ai')"
      />
      <UButton
        v-if="!readOnly && ['ready', 'empty'].includes(outcome)"
        label="Manage groups"
        icon="i-lucide-tags"
        variant="outline"
        color="neutral"
        @click="emit('categories')"
      />
      <UButton
        v-if="!readOnly && ['ready', 'empty'].includes(outcome)"
        label="Add item"
        icon="i-lucide-plus"
        @click="emit('create', 'food')"
      />
    </template>
  </WorkspaceKitchenCollectionHeader>

  <WorkspaceKitchenCollectionToolbar
    v-if="outcome === 'ready' || outcome === 'empty'"
    v-model="query"
    :label="catalogue.plural"
    :singular="catalogue.singular"
    :count="visibleDishes.length"
  >
    <template #controls>
      <USelect
        v-if="catalogue.itemKind === 'all'"
        v-model="group"
        :items="groupFilters"
        aria-label="Filter Items by group"
      />
      <div class="catalogue-views" role="group" aria-label="Catalogue view">
        <UButton
          icon="i-lucide-layout-grid"
          aria-label="Grid view"
          :aria-pressed="view === 'grid'"
          color="neutral"
          :variant="view === 'grid' ? 'soft' : 'ghost'"
          @click="view = 'grid'"
        />
        <UButton
          icon="i-lucide-list"
          aria-label="List view"
          :aria-pressed="view === 'list'"
          color="neutral"
          :variant="view === 'list' ? 'soft' : 'ghost'"
          @click="view = 'list'"
        />
      </div>
    </template>
  </WorkspaceKitchenCollectionToolbar>
  <div
    v-if="outcome === 'ready' || outcome === 'empty'"
    class="catalogue-filters"
    role="group"
    aria-label="Filter catalogue"
  >
    <button
      v-for="item in filters"
      :key="item.value"
      type="button"
      :aria-pressed="filter === item.value"
      :class="{ selected: filter === item.value }"
      @click="filter = item.value"
    >
      {{ item.label }} <span>{{ item.count }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useKitchenDishesContext } from '../../../../composables/workspace/dishes/useKitchenDishesContext'
import { useDishCatalogueContext } from '../../../../composables/workspace/dishes/useDishCatalogue'
const { catalogue, readOnly, outcome } = useKitchenDishesContext()
const { groupFilters, group, query, view, visibleDishes, filter, filters } =
  useDishCatalogueContext()
const emit = defineEmits<{
  create: [kind: 'food' | 'drink']
  categories: []
  ai: []
}>()
</script>

<style scoped>
.catalogue-views {
  display: flex;
  align-items: center;
  gap: 8px;
}
.catalogue-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
}
.catalogue-filters button {
  display: flex;
  gap: 8px;
  align-items: center;
  border-radius: 8px;
  padding: 7px 10px;
  color: var(--ui-text-muted);
  border: 1px solid var(--ui-border);
}
.catalogue-filters button.selected {
  color: var(--ui-text-highlighted);
  background: var(--ui-bg-elevated);
}
.catalogue-filters button span {
  opacity: 0.65;
  font-variant-numeric: tabular-nums;
}
</style>
