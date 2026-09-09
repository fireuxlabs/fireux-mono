<template>
  <section class="entity-collection kitchen-collection">
    <CollectionHeader :title="title" :description="description">
      <template #controls>
        <UInput
          v-model="query"
          :placeholder="searchPlaceholder"
          :aria-label="searchPlaceholder"
          icon="i-lucide-search"
          class="entity-collection__search"
        />

        <span v-if="showCount" class="entity-collection__count">
          {{ countLabel }}
        </span>
      </template>
    </CollectionHeader>

    <div
      v-if="categoryFilters.length > 1"
      class="kitchen-collection__filters"
      aria-label="Filter Kitchens by category"
    >
      <UButton
        v-for="filter in categoryFilters"
        :key="filter.value"
        :color="selectedCategory === filter.value ? 'primary' : 'neutral'"
        :variant="selectedCategory === filter.value ? 'soft' : 'ghost'"
        size="sm"
        @click="selectedCategory = filter.value"
      >
        {{ filter.label }}
      </UButton>
    </div>

    <div v-if="cardsFiltered.length" class="kitchen-collection__results">
      <KitchenCollectionList :cards="cardsFiltered" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain manager retained.
import { computed, ref } from 'vue'
import type { KitchenCollectionRecord } from '../composables/firestore/useKitchenCollection'
import { useKitchenInterface } from '../composables/useKitchenInterface'
import type { KitchenSurface } from '../models/kitchen-interface.model'

type KitchenCollectionItem = KitchenSurface

const props = defineProps<{
  kitchens: KitchenCollectionRecord[]
}>()

const { interface: makeCard, surface } = useKitchenInterface()
const collectionSurface = computed<KitchenCollectionItem[]>(() =>
  props.kitchens.flatMap((kitchen) => {
    const item = surface({ kitchen, place: kitchen.place })
    return item ? [item] : []
  })
)
const searchPlaceholder = 'Search kitchens…'
const title = 'Kitchen directory'
const description =
  'Discover Kitchens, their menus, and the ways they serve their communities.'
const showCount = true
const selectedCategory = ref('all')
const allCollection = computed<KitchenCollectionItem[]>(() =>
  collectionSurface.value.filter((row): row is KitchenCollectionItem =>
    Boolean(makeCard(row))
  )
)
const categoryFilters = computed(() => {
  const categories = new Set<string>()
  for (const kitchen of allCollection.value) {
    const card = makeCard(kitchen)
    for (const label of card?.categoryLabels ?? []) categories.add(label)
  }
  return [
    { value: 'all', label: 'All Kitchens' },
    ...[...categories].sort().map((category) => ({
      value: category,
      label: category,
    })),
  ]
})
const collection = computed<KitchenCollectionItem[]>(() =>
  selectedCategory.value === 'all'
    ? allCollection.value
    : allCollection.value.filter((kitchen) =>
        makeCard(kitchen)?.categoryLabels.includes(selectedCategory.value)
      )
)

const { query, visibleItems, visibleCount } = useCollectionSearch<
  KitchenCollectionItem,
  NonNullable<ReturnType<typeof makeCard>>
>({
  items: collection,
  makeCard: (kitchen: KitchenCollectionItem) => makeCard(kitchen),
  initialVariant: 'cell',
})

const cardsFiltered = computed(() =>
  visibleItems.value
    .map(makeCard)
    .filter((card): card is NonNullable<typeof card> => Boolean(card))
)

const totalCount = computed(() => collection.value.length)
const countLabel = computed(() =>
  query.value
    ? `${visibleCount.value} of ${totalCount.value} kitchens`
    : `${totalCount.value} kitchen${totalCount.value === 1 ? '' : 's'}`
)
</script>

<style scoped>
.kitchen-collection__results {
  display: grid;
  gap: calc(var(--spacing) * 5);
}

.kitchen-collection__filters {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
  margin-bottom: calc(var(--spacing) * 6);
}

.kitchen-collection__more {
  display: flex;
  justify-content: center;
}
</style>
