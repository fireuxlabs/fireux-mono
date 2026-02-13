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
            v-if="showSearch"
            v-model="query"
            size="xs"
            :placeholder="searchPlaceholder"
          />
          <UButton
            v-if="showVariantToggle"
            size="xs"
            variant="ghost"
            :icon="variant === 'pill' ? 'i-lucide-list' : 'i-lucide-layout-grid'"
            :aria-label="variant === 'pill' ? 'Switch to list view' : 'Switch to grid view'"
            @click="toggleVariant"
          />
          <UBadge v-if="showCount" variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
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
              :to="linkEnabled ? (card.to || undefined) : undefined"
              class="block"
              :class="linkEnabled && card.to ? '' : 'cursor-default'"
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
              :to="linkEnabled ? (card.to || undefined) : undefined"
              class="block"
              :class="linkEnabled && card.to ? '' : 'cursor-default'"
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

    <div v-if="isDev">
      <DevJson
        :title="'Dishes (JSON)'"
        context="collection manager · dishes"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { computed } from 'vue';
import { useDishInterface } from '../../../../composables/fireux/firestore/dish/utils/view/useDishInterface';
import type { Dish } from '../../../../models/dish.model';

const props = withDefaults(
  defineProps<{
    collection?: Dish[]
    title?: string
    description?: string
    searchPlaceholder?: string
    showSearch?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    initialVariant?: 'pill' | 'cell'
    link?: boolean
  }>(),
  {
    title: 'Dishes',
    description: 'Browse dishes available to this kitchen.',
    searchPlaceholder: 'Search dishes...',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
    link: true,
  }
)

const { card: makeCard, preview: makePreview, searchText } = useDishInterface()

const collection = computed(() => props.collection ?? [])
const searchPlaceholder = computed(() => String(props.searchPlaceholder || 'Search dishes...'))
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const linkEnabled = computed(() => props.link !== false)
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
} = useCollectionSearch<Dish, ReturnType<typeof makeCard>>({
  items: collection,
  searchText: (dish: Dish) => searchText(dish),
  makeCard: (dish: Dish) => makeCard(dish),
  initialVariant: props.initialVariant,
})
const isDev = import.meta.dev
</script>
