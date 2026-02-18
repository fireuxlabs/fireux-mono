<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>{{ title }}</div>
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
        <UPopover :popper="{ placement: 'right-start' }">
          <template #default>
            <NuxtLink
              :to="linkEnabled ? (card.to || undefined) : undefined"
              class="block"
              :class="linkEnabled && card.to ? '' : 'cursor-default'"
            >
              <MenuCardsPill v-bind="card" />
            </NuxtLink>
          </template>
          <template #content>
            <div class="w-[20rem] p-3">
              <MenuCardsPreview v-if="previewById[card.id]" v-bind="previewById[card.id]" />
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
              <MenuCardsCell v-bind="card" :prop="card.description" />
            </NuxtLink>
          </template>
          <template #content>
            <div class="w-[20rem] p-3">
              <MenuCardsPreview v-if="previewById[card.id]" v-bind="previewById[card.id]" />
            </div>
          </template>
        </UPopover>
      </template>
    </MenuCollectionList>

    <p v-else class="text-sm text-dimmed">
      {{ query ? 'No menus match your search.' : 'No menus found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        :title="'Menus (JSON)'"
        context="collection manager · menus"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import MenuCardsCell from '../Cards/Cell.vue'
import MenuCardsPill from '../Cards/Pill.vue'
import MenuCardsPreview from '../Cards/Preview.vue'
import MenuCollectionList from './List.vue'
import { useMenuInterface } from '../../../../composables/fireux/firestore/menu/utils/view/useMenuInterface'
import type { Menu } from '../../../../models/menu.model'

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

const { card: makeCard, preview: makePreview, searchText } = useMenuInterface()

const collection = computed(() => props.collection ?? [])
const searchPlaceholder = computed(() => String(props.searchPlaceholder || 'Search menus...'))
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const linkEnabled = computed(() => props.link !== false)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(() => showSearch.value && totalCount.value > 15)
const nowTick = ref(Date.now())
let tickInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  tickInterval = setInterval(() => {
    nowTick.value = Date.now()
  }, 60000)
})

onBeforeUnmount(() => {
  if (!tickInterval) return
  clearInterval(tickInterval)
  tickInterval = null
})

const collectionVisible = computed(() => {
  // Recompute cards periodically so active/inactive menu chips follow time windows.
  void nowTick.value

  return [...collection.value].sort(
    (a, b) =>
      Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
      String(a.name || '').localeCompare(String(b.name || ''))
  )
})

const previewById = computed(() => {
  const map: Record<string, ReturnType<typeof makePreview> | null> = {}
  for (const menu of collectionVisible.value) {
    const card = makeCard(menu)
    if (!card?.id) continue
    map[card.id] = makePreview(menu)
  }
  return map
})

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<Menu, ReturnType<typeof makeCard>>({
  items: collectionVisible,
  searchText: (menu: Menu) => searchText(menu),
  makeCard: (menu: Menu) => makeCard(menu),
  initialVariant: props.initialVariant,
})
const isDev = import.meta.dev
</script>
