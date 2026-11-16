<template>
  <section class="entity-collection kitchen-collection">
    <PublicKitchenCollectionControls
      v-model:query="query"
      v-model:category="selectedCategory"
      :count-label="countLabel"
      :categories="categoryFilters"
    />

    <UAlert
      v-if="allCollection.length && !cardsFiltered.length"
      title="No Kitchens found"
      description="Try another search or category."
      color="neutral"
      variant="soft"
      icon="i-lucide-search"
    />
    <PublicKitchenCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
    />
  </section>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { computed, ref } from 'vue'
import type { KitchenDirectoryEntry } from '../../../types/public'
import { useKitchenInterface } from '../../../composables/useKitchenInterface'
import type { KitchenCard } from '../../../types/presentation'

const props = defineProps<{
  kitchens: KitchenDirectoryEntry[]
}>()

const { interface: makeCard, surface } = useKitchenInterface()
const selectedCategory = ref('all')
const allCollection = computed<KitchenCard[]>(() =>
  props.kitchens.flatMap((kitchen) => {
    const item = surface({ kitchen, place: kitchen.place })
    const card = item ? makeCard(item) : null
    return card ? [card] : []
  })
)
const categoryFilters = computed(() => {
  const categories = new Set<string>()
  for (const card of allCollection.value) {
    for (const label of card.categoryLabels) categories.add(label)
  }
  return [
    { value: 'all', label: 'All Kitchens' },
    ...[...categories].sort().map((category) => ({
      value: category,
      label: category
        .replace(/-/g, ' ')
        .replace(/^./, (letter) => letter.toUpperCase()),
    })),
  ]
})
const collection = computed<KitchenCard[]>(() =>
  selectedCategory.value === 'all'
    ? allCollection.value
    : allCollection.value.filter((card) =>
        card.categoryLabels.includes(selectedCategory.value)
      )
)

const {
  query,
  visibleItems: cardsFiltered,
  visibleCount,
} = useCollectionSearch<KitchenCard, KitchenCard>({
  items: collection,
  makeCard: (card) => card,
  searchText: (card) =>
    [
      card.name,
      card.shortName,
      card.formattedAddress,
      card.tagline,
      card.about,
      ...card.categoryLabels,
      ...card.serviceLabels,
    ].join(' '),
  initialVariant: 'cell',
})

const totalCount = computed(() => collection.value.length)
const countLabel = computed(() =>
  query.value
    ? `${visibleCount.value} of ${totalCount.value} kitchens`
    : `${totalCount.value} kitchen${totalCount.value === 1 ? '' : 's'}`
)
</script>

<style scoped>
.kitchen-collection {
  display: grid;
  gap: calc(var(--spacing) * 6);
  min-width: 0;
}
</style>
