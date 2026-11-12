<template>
  <FireStateCard
    v-if="error"
    state="error"
    :title="`${catalogue.title} unavailable`"
    :description="String(error)"
  />
  <FireState v-else-if="pending" outcome="pending" :entity="catalogue.plural" />
  <div v-else-if="!visibleDishes.length" class="catalogue-empty">
    <UIcon :name="catalogue.icon" />
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
  <div v-else-if="view === 'list'" class="item-work-list">
    <div class="item-work-row item-work-head" aria-hidden="true">
      <span>Item</span><span>Price</span>
    </div>
    <article v-for="dish in pageDishes" :key="dish.id" class="item-work-row">
      <div class="item-work-main">
        <NuxtLink :to="dishLink(dish.id)" class="item-work-identity">
          <KitchenMenuItemsPhoto
            :src="dish.image"
            :alt="dish.name"
            class="item-work-image"
          />
          <span
            ><strong>{{ dish.name }}</strong
            ><small v-if="dish.description">{{ dish.description }}</small></span
          >
        </NuxtLink>
        <NuxtLink
          v-if="choiceSummary(dish)"
          :to="`${dishLink(dish.id)}&view=details#item-price-choices`"
          class="item-work-choices"
          :aria-label="`Configure ${dish.name} choices`"
        >
          {{ choiceSummary(dish) }}
        </NuxtLink>
      </div>
      <div class="item-work-details">
        <span class="item-work-price"
          ><span class="item-work-mobile-label">Price</span
          >{{ priceLabel(dish) }}</span
        >
      </div>
    </article>
  </div>
  <div
    v-else-if="view === 'grid'"
    :class="view === 'grid' ? 'dish-grid' : 'dish-list'"
  >
    <KitchenMenuItemsCardsCell
      v-for="dish in pageDishes"
      :id="dish.id"
      :key="dish.id"
      :title="dish.name || dish.id"
      :image-url="dish.image"
      :description="dish.description"
      :meta="tileMeta(dish)"
      :choices-label="choiceSummary(dish)"
      :price-label="priceLabel(dish)"
      :list="false"
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
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  readItemChoiceGroups,
  itemChoiceRule,
  priceItemChoices,
} from '../../../../utils/item-choices'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/place/utils/place-spine'
import type { Dish } from '../../../../models/dish.model'
import { useKitchenDishesContext } from '../../../../composables/workspace/dishes/useKitchenDishesContext'
import { useDishCatalogueContext } from '../../../../composables/workspace/dishes/useDishCatalogue'
import { dishCategoryLabel } from '../../../../models/dish.model'
const {
  catalogue,
  dishes,
  pending,
  error,
  readOnly,
  outcome,
  selectedKitchen,
} = useKitchenDishesContext()
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
const currency = computed(() => readPlaceCurrencyCode(selectedKitchen.value))
function choiceSummary(dish: Dish) {
  return readItemChoiceGroups(dish)
    .map(
      (group) =>
        `${group.name} · ${itemChoiceRule(group)} · ${group.options.length} ${group.options.length === 1 ? 'choice' : 'choices'}`
    )
    .join(' / ')
}
function tileMeta(dish: Dish) {
  const category = dish.category ? dishCategoryLabel(dish.category) : ''
  return category === 'Uncategorised' ? '' : category
}
function priceLabel(dish: Dish) {
  const groups = readItemChoiceGroups(dish)
  if (
    dish.price === undefined &&
    !groups.some((group) => group.pricing === 'full')
  )
    return 'Not set'
  const selections = Object.fromEntries(
    groups.map((group) => [
      group.id,
      [...group.options]
        .sort((a, b) => a.price - b.price)
        .slice(0, group.min)
        .map((option) => option.id),
    ])
  )
  const value =
    priceItemChoices(dish.price ?? 0, groups, selections).unitMinor / 100
  const formatted = new Intl.NumberFormat('en', {
    style: 'currency',
    currency: currency.value,
  }).format(value)
  return groups.length ? `From ${formatted}` : formatted
}
</script>

<style scoped>
.item-work-image {
  inline-size: 3rem;
  block-size: 3rem;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: var(--ui-radius);
  display: grid;
  place-items: center;
}
.item-work-main {
  min-inline-size: 0;
  display: grid;
  gap: calc(var(--spacing) * 2);
}
.item-work-choices {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
  overflow-wrap: anywhere;
}
.item-work-choices:hover {
  color: var(--ui-text);
  text-decoration: underline;
}
.item-work-details {
  display: contents;
}
.item-work-list {
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  overflow: hidden;
}
.item-work-row {
  display: grid;
  grid-template-columns: minmax(12rem, 3fr) minmax(6rem, 1fr);
  align-items: center;
  gap: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 3);
}
.item-work-row + .item-work-row {
  border-top: 1px solid var(--ui-border);
}
.item-work-head {
  background: var(--ui-bg-elevated);
  color: var(--ui-text-muted);
  font-size: 0.75rem;
}
.item-work-identity {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 3);
  min-width: 0;
}
.item-work-identity > span {
  min-width: 0;
}
.item-work-identity strong {
  display: block;
  font-size: 0.875rem;
  overflow-wrap: anywhere;
}
.item-work-identity small {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--ui-text-muted);
}
.item-work-price {
  font-size: 0.8125rem;
  color: var(--ui-text-muted);
  overflow-wrap: anywhere;
}
.item-work-price {
  font-variant-numeric: tabular-nums;
  color: var(--ui-text);
}
.item-work-mobile-label {
  display: none;
}
@media (max-width: 900px) {
  .item-work-head {
    display: none;
  }
  .item-work-row {
    grid-template-columns: minmax(0, 1fr);
    gap: calc(var(--spacing) * 2);
  }
  .item-work-details {
    display: flex;
    flex-wrap: wrap;
    grid-column: 1;
    gap: calc(var(--spacing) * 2) calc(var(--spacing) * 4);
  }
  .item-work-mobile-label {
    display: inline;
    margin-inline-end: calc(var(--spacing) * 2);
    color: var(--ui-text-dimmed);
  }
}

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
