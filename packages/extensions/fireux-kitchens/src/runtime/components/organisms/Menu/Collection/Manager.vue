<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
        </div>

        <div class="collection-manager__controls flex flex-1 items-center gap-2">
          <div class="ml-auto flex items-center gap-2">
            <UInput
              v-if="showSearchInput"
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
      </div>
    </template>

    <MenuCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <MenuCardsPill v-bind="card" :link="linkEnabled" />
      </template>

      <template #cell="{ card }">
        <MenuCardsCell v-bind="card" :link="linkEnabled" />
      </template>
    </MenuCollectionList>

    <p v-else class="text-sm text-dimmed">
      {{ query ? 'No menus match your search.' : 'No menus found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        :title="'Menus (JSON)'"
        context="collection manager · menus"
        :data="devJsonData"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { computed } from 'vue'
import { useMenuInterface } from '../../../../composables/fireux/firestore/runtime-kitchen/menu/utils/view/useMenuInterface'
import type { Menu } from '../../../../models/menu.model'
import MenuCardsCell from '../Cards/Cell.vue'
import MenuCardsPill from '../Cards/Pill.vue'
import MenuCollectionList from './List.vue'

const props = withDefaults(
  defineProps<{
    collection?: Menu[]
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
    title: 'Menus',
    description: 'Browse menus for this kitchen.',
    searchPlaceholder: 'Search menus...',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
    link: true,
  }
)

const { pill: makeCard } = useMenuInterface()

const collection = computed(() => props.collection ?? [])
const { devJsonData } = useDevCollectionJson(collection)
const searchPlaceholder = computed(() => String(props.searchPlaceholder || 'Search menus...'))
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const linkEnabled = computed(() => props.link !== false)

const collectionVisible = computed(() => {
  return [...collection.value].sort(
    (a, b) =>
      Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
      String(a.name || '').localeCompare(String(b.name || ''))
  )
})

const totalCount = computed(() => collectionVisible.value.length)
const showSearchInput = computed(() => showSearch.value && totalCount.value > 15)

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<Menu, ReturnType<typeof makeCard>>({
  items: collectionVisible,
  makeCard: (menu: Menu) => makeCard(menu),
  initialVariant: props.initialVariant,
})
const isDev = import.meta.dev
</script>
