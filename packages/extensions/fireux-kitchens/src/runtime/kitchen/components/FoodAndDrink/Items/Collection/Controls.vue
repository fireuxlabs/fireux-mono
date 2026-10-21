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
        v-if="
          catalogue.itemKind !== 'all' &&
          !readOnly &&
          (outcome === 'ready' || outcome === 'empty')
        "
        :label="`Add ${catalogue.singular}`"
        icon="i-lucide-plus"
        @click="
          emit('create', catalogue.itemKind === 'drink' ? 'drink' : 'food')
        "
      />
      <template
        v-if="
          catalogue.itemKind === 'all' &&
          !readOnly &&
          ['ready', 'empty'].includes(outcome)
        "
      >
        <UButton
          label="Add dish"
          @click="emit('create', 'food')"
          icon="i-lucide-plus"
        />
        <UButton
          label="Add drink"
          @click="emit('create', 'drink')"
          color="neutral"
          variant="outline"
          icon="i-lucide-plus"
        />
      </template>
    </template>
  </WorkspaceKitchenCollectionHeader>

  <div
    v-if="catalogue.itemKind === 'all'"
    class="catalogue-tabs"
    role="group"
    aria-label="Food and drink catalogue"
  >
    <button
      v-for="option in kindFilters"
      :key="option.value"
      type="button"
      :aria-pressed="kind === option.value"
      :class="{ selected: kind === option.value }"
      @click="kind = option.value"
    >
      {{ option.label }}
    </button>
  </div>

  <WorkspaceKitchenCollectionToolbar
    v-if="outcome === 'ready' || outcome === 'empty'"
    v-model="query"
    :label="catalogue.plural"
    :singular="catalogue.singular"
    :count="visibleDishes.length"
  >
    <template #controls>
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
    v-if="
      (catalogue.itemKind === 'food' || kind === 'food') &&
      (outcome === 'ready' || outcome === 'empty')
    "
    class="catalogue-filters"
    role="group"
    aria-label="Dish categories"
  >
    <button
      v-for="item in categoryFilters"
      :key="item.value"
      :aria-pressed="category === item.value"
      :class="{ selected: category === item.value }"
      @click="category = item.value"
    >
      {{ item.label }} <span>{{ item.count }}</span>
    </button>
    <UButton
      v-if="!readOnly && (outcome === 'ready' || outcome === 'empty')"
      label="Organise categories"
      icon="i-lucide-tags"
      variant="ghost"
      color="neutral"
      @click="emit('categories')"
    />
  </div>
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
const {
  kindFilters,
  kind,
  query,
  view,
  visibleDishes,
  category,
  categoryFilters,
  filter,
  filters,
} = useDishCatalogueContext()
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
.catalogue-tabs {
  display: flex;
  gap: 28px;
  border-bottom: 1px solid var(--ui-border);
}
.catalogue-tabs button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 2px 14px;
  color: var(--ui-text-muted);
  border-bottom: 2px solid transparent;
  font-weight: 500;
}
.catalogue-tabs button.selected {
  color: var(--ui-primary);
  border-color: var(--ui-primary);
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
