<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>{{ title }}</div>
          <p>{{ description }}</p>
        </div>

        <div class="collection-manager__controls">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search dishes..."
          />
          <UButton
            size="xs"
            variant="ghost"
            :icon="variant === 'pill' ? 'i-lucide-list' : 'i-lucide-layout-grid'"
            :aria-label="variant === 'pill' ? 'Switch to list view' : 'Switch to grid view'"
            @click="toggleVariant"
          />
          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <DishCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <UPopover :popper="{ placement: 'right-start' }">
          <template #default>
            <NuxtLink
              :to="card.to || undefined"
              class="block"
              :class="card.to ? '' : 'cursor-pointer'"
            >
              <DishCardsPill v-bind="card" />
            </NuxtLink>
          </template>
          <template #content>
            <div class="w-[20rem] p-3">
              <DishCardsPreview v-if="previewById[card.id]" v-bind="previewById[card.id]" />
            </div>
          </template>
        </UPopover>
      </template>
      <template #cell="{ card }">
        <UPopover :popper="{ placement: 'right-start' }">
          <template #default>
            <NuxtLink
              :to="card.to || undefined"
              class="block"
              :class="card.to ? '' : 'cursor-pointer'"
            >
              <DishCardsCell v-bind="card" :prop="card.description" />
            </NuxtLink>
          </template>
          <template #content>
            <div class="w-[20rem] p-3">
              <DishCardsPreview v-if="previewById[card.id]" v-bind="previewById[card.id]" />
            </div>
          </template>
        </UPopover>
      </template>
    </DishCollectionList>

    <p v-else class="text-sm text-dimmed">
      {{ query ? 'No dishes match your search.' : 'No dishes found.' }}
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { computed } from 'vue';
import { useDishInterface } from '../../../../composables/fireux/firestore/dish/utils/view/useDishInterface';
import type { KitchenDish } from '../../../../models/dish.model';

const props = withDefaults(
  defineProps<{
    collection?: KitchenDish[]
    title?: string
    description?: string
  }>(),
  {
    title: 'Dishes',
    description: 'Browse dishes available to this kitchen.',
  }
)

const { card: makeCard, preview: makePreview, searchText } = useDishInterface()

const collection = computed(() => props.collection ?? [])
const totalCount = computed(() => collection.value.length)

const previewById = computed(() => {
  const map: Record<string, ReturnType<typeof makePreview> | null> = {}
  for (const dish of collection.value) {
    const card = makeCard(dish)
    if (!card?.id) continue
    map[card.id] = makePreview(dish)
  }
  return map
})

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<KitchenDish, ReturnType<typeof makeCard>>({
  items: collection,
  searchText: (dish: KitchenDish) => searchText(dish),
  makeCard: (dish: KitchenDish) => makeCard(dish),
})
</script>
