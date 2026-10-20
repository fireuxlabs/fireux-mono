<template>
  <MoleculesStateCard
    v-if="error"
    state="error"
    :title="`${catalogue.title} unavailable`"
    :description="String(error)"
  />
  <div
    v-else-if="pending"
    class="dish-grid"
    aria-label="Loading catalogue"
    aria-busy="true"
  >
    <USkeleton v-for="n in 8" :key="n" class="h-64 rounded-xl" />
  </div>
  <div v-else-if="!visibleDishes.length" class="catalogue-empty">
    <UIcon :name="catalogue.icon" class="size-8 text-muted" />
    <h2>{{ dishes.length ? 'No matches' : `No ${catalogue.plural} yet` }}</h2>
    <UButton
      v-if="dishes.length"
      label="Clear filters"
      color="neutral"
      variant="soft"
      @click="clearFilters"
    />
    <UButton
      v-else-if="
        catalogue.itemKind !== 'all' &&
        !readOnly &&
        (outcome === 'ready' || outcome === 'empty')
      "
      :label="`Add ${catalogue.singular}`"
      @click="emit('create', catalogue.itemKind === 'drink' ? 'drink' : 'food')"
      icon="i-lucide-plus"
    />
  </div>
  <div v-else :class="view === 'grid' ? 'dish-grid' : 'dish-list'">
    <WorkspaceKitchenDishesCardsCell
      v-for="dish in pageDishes"
      :id="dish.id"
      :key="dish.id"
      :title="dish.name || dish.id"
      :image-url="dish.image"
      :description="dish.description"
      :meta="
        [
          dish.item_kind === 'food' ? dishCategoryLabel(dish.category) : '',
          dish.spec ? 'Spec added' : '',
        ]
          .filter(Boolean)
          .join(' · ')
      "
      :list="view === 'list'"
      expanded
      link
      :to="dishLink(dish.id)"
    />
  </div>

  <UPagination
    v-if="!pending && !error && visibleDishes.length > pageSize"
    v-model:page="page"
    :total="visibleDishes.length"
    :items-per-page="pageSize"
    :sibling-count="1"
    class="justify-center"
  />
</template>

<script setup lang="ts">
import { useKitchenDishesContext } from '../../../../composables/workspace/dishes/useKitchenDishesContext'
import { useDishCatalogueContext } from '../../../../composables/workspace/dishes/useDishCatalogue'
import { dishCategoryLabel } from '../../../../models/dish.model'
const { catalogue, dishes, pending, error, readOnly, outcome } =
  useKitchenDishesContext()
const {
  visibleDishes,
  pageDishes,
  view,
  dishLink,
  clearFilters,
  page,
  pageSize,
} = useDishCatalogueContext()
const emit = defineEmits<{ create: [kind: 'food' | 'drink'] }>()
</script>

<style scoped>
.dish-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 20px;
}
.dish-list {
  display: grid;
  gap: 10px;
}
.catalogue-empty {
  display: grid;
  justify-items: center;
  gap: 16px;
  padding: 64px 20px;
  border: 1px dashed var(--ui-border);
  border-radius: 16px;
}
.catalogue-empty h2 {
  font-size: 18px;
  font-weight: 600;
}
@media (max-width: 640px) {
  .dish-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
}
</style>
