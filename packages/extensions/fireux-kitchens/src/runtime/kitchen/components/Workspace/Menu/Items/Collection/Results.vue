<template>
  <FireState
    v-if="outcome === 'pending'"
    outcome="pending"
    :entity="storageKitchenId ? catalogue.plural : 'Kitchen'"
  />
  <UAlert
    v-else-if="!storageKitchenId && outcome === 'error'"
    title="Kitchen unavailable"
    description="Your Kitchen could not be loaded. Please try again."
    color="error"
    variant="soft"
    role="alert"
    aria-live="assertive"
  >
    <template #actions>
      <FireCopyError
        message="Kitchen unavailable&#10;Your Kitchen could not be loaded. Please try again."
      />
    </template>
  </UAlert>
  <UAlert
    v-else-if="!storageKitchenId"
    :title="outcome === 'empty' ? 'Kitchen not found' : 'Select a kitchen'"
    :description="
      outcome === 'empty'
        ? `Choose an available Kitchen to manage ${catalogue.plural}.`
        : `Choose a kitchen before managing ${catalogue.plural}.`
    "
    color="neutral"
    variant="soft"
  />
  <UAlert
    v-else-if="error"
    :title="`${catalogue.title} unavailable`"
    :description="String(error)"
    color="error"
    variant="soft"
    role="alert"
    aria-live="assertive"
  >
    <template #actions>
      <FireCopyError
        :message="
          [`${catalogue.title} unavailable`, String(error)]
            .filter(Boolean)
            .join('\n')
        "
      />
    </template>
  </UAlert>
  <div v-else-if="!visibleCount" class="catalogue-empty">
    <UIcon :name="catalogue.icon" />
    <h2>
      {{ outcome === 'ready' ? 'No matches' : `No ${catalogue.plural} yet` }}
    </h2>
    <UButton
      v-if="outcome === 'ready'"
      label="Clear filters"
      color="neutral"
      variant="soft"
      @click="clearFilters"
    />
    <UButton
      v-else-if="catalogue.itemKind !== 'all' && canCreate"
      :label="`Add ${catalogue.singular}`"
      @click="openCreate(catalogue.itemKind === 'drink' ? 'drink' : 'food')"
      icon="i-lucide-plus"
    />
  </div>
  <div v-else-if="view === 'list'" class="item-work-list" aria-label="Items">
    <MenuItemDisplay
      v-for="dish in pageItems"
      :key="dish.id"
      :name="dish.name || dish.id"
      :name-to="itemLink(dish.id)"
      :image-url="dish.image"
      :description="dish.description"
      :price="priceLabel(dish)"
    >
      <NuxtLink
        v-if="choiceSummary(dish)"
        :to="itemLink(dish.id, { view: 'details' }, '#item-price-choices')"
        class="item-work-choices"
        :aria-label="`Configure ${dish.name} choices`"
      >
        {{ choiceSummary(dish) }}
      </NuxtLink>
    </MenuItemDisplay>
  </div>
  <div v-else-if="view === 'grid'" class="dish-grid">
    <KitchenWorkspaceMenuItemsCardsCell
      v-for="dish in pageItems"
      :id="dish.id"
      :key="dish.id"
      :title="dish.name || dish.id"
      :image-url="dish.image"
      :description="dish.description"
      :choices-label="choiceSummary(dish)"
      :price-label="priceLabel(dish)"
      :list="false"
      expanded
      link
      :to="itemLink(dish.id)"
    />
  </div>

  <UPagination
    v-if="
      storageKitchenId &&
      outcome === 'ready' &&
      !error &&
      visibleCount > pageSize
    "
    v-model:page="page"
    :total="visibleCount"
    :items-per-page="pageSize"
    :sibling-count="1"
  />
</template>

<script setup lang="ts">
import {
  readItemChoiceGroups,
  itemChoiceRule,
  priceItemChoices,
} from '../../../../../utils/item-choices'
import type { ItemCollectionRow } from '../../../../../utils/item'
import { useItemCatalogueContext } from '../../../../../composables/workspace/menu/items/useItemCatalogue'
const {
  catalogue,
  storageKitchenId,
  error,
  canCreate,
  outcome,
  currency,
  visibleCount,
  pageItems,
  view,
  itemLink,
  clearFilters,
  openCreate,
  page,
  pageSize,
} = useItemCatalogueContext()
function choiceSummary(dish: ItemCollectionRow) {
  return readItemChoiceGroups(dish)
    .map(
      (group) =>
        `${group.name} · ${itemChoiceRule(group)} · ${group.options.length} ${group.options.length === 1 ? 'choice' : 'choices'}`
    )
    .join(' / ')
}
function priceLabel(dish: ItemCollectionRow) {
  if (dish.pricing_error) return 'Review price & choices'
  const groups = readItemChoiceGroups(dish)
  if (
    dish.price === undefined &&
    !groups.some((group) => group.pricing === 'full')
  )
    return 'Not set'
  if (!currency.value) return 'Currency not set'
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
.item-work-list {
  min-width: 0;
}
.item-work-choices {
  display: inline-block;
  margin-block-start: var(--spacing);
  font-size: var(--text-xs);
  color: var(--ui-text-muted);
  overflow-wrap: anywhere;
}
.item-work-choices:hover {
  color: var(--ui-text);
  text-decoration: underline;
}

.dish-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 20px;
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
