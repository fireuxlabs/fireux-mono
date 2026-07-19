<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p v-if="description">{{ description }}</p>
        </div>

        <div
          class="collection-manager__controls"
        >
          <div class="ml-auto flex items-center gap-2">
            <UInput
              v-if="showSearchInput"
              v-model="query"
              size="xs"
              :placeholder="searchPlaceholder"
              :aria-label="searchPlaceholder"
            />

            <UButton
              v-if="showVariantToggle"
              size="xs"
              variant="ghost"
              :icon="
                variant === 'pill' ? 'i-lucide-list' : 'i-lucide-layout-grid'
              "
              :aria-label="
                variant === 'pill'
                  ? 'Switch to list view'
                  : 'Switch to grid view'
              "
              @click="toggleVariant"
            />

            <UBadge v-if="showCount && isSettled" variant="soft"
              >{{ countLabel }}</UBadge
            >
          </div>
        </div>
      </div>
    </template>

    <MoleculesStateCard
      v-if="outcome === 'pending'"
      entity="apps"
      state="loading"
      surface="bare"
    />

    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      entity="apps"
      state="error"
      surface="bare"
      description="Apps could not be loaded. Please try again."
    />

    <AppCollectionList
      v-else-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <AppCardsPill v-bind="card" :link="linkEnabled" />
      </template>
      <template #cell="{ card }">
        <AppCardsCell v-bind="card" :link="linkEnabled" />
      </template>
    </AppCollectionList>

    <MoleculesStateCard
      v-else
      entity="apps"
      state="empty"
      surface="bare"
      :title="query ? 'No apps match your search' : 'No apps yet'"
      :description="query
        ? 'Try a different search term.'
        : 'Once app records are added, they will display here.'"
    />

    <div>
      <DevJson
        :title="'Apps (JSON)'"
        :context="devJsonContext"
        :data="devJsonData"
        :default-open="false"
        @opened="loadDevJson"
        @closed="unloadDevJson"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain manager retained.
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { computed } from 'vue'
import {
  useAppInterface,
  type AppViewSource,
} from '../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import { useCollectionSearch } from '../../../composables/shared/useCollectionSearch'
import { useCollectionVariantCards } from '../../../composables/shared/useCollectionVariantCards'
import type { AppDirectoryController } from '../../../models/core/supporting/directory'

const props = withDefaults(
  defineProps<{
    controller: AppDirectoryController
    title?: string
    description?: string
    link?: boolean
    searchPlaceholder?: string
    showSearch?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    initialVariant?: 'pill' | 'cell'
  }>(),
  {
    title: 'Apps',
    description: 'Browse canonical app records for the current ecosystem.',
    link: true,
    searchPlaceholder: 'Search apps…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
  }
)

const collection = computed<AppViewSource[]>(() => props.controller.apps.value)
const outcome = computed(() => props.controller.outcome.value)
const isSettled = computed(() =>
  outcome.value === 'ready' || outcome.value === 'empty'
)
const { devJsonData, loadDevJson, unloadDevJson } = useDevCollectionJson(collection)
const title = computed(() => String(props.title || 'Apps'))
const description = computed(() =>
  String(
    props.description ||
      'Browse canonical app records for the current ecosystem.'
  )
)
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search apps…')
)
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)
const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = useAppInterface()
const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<AppViewSource, NonNullable<ReturnType<typeof makeCard>>>({
    items: collection,
    makeCard: (app) => makeCard(app),
    initialVariant: props.initialVariant,
  })

const { cards: cardsFiltered } = useCollectionVariantCards({
  items: visibleItems,
  variant,
  makeCard,
  makePill,
  makeCell,
})

const countLabel = computed(() =>
  showSearchInput.value && query.value
    ? `${visibleCount.value} / ${totalCount.value}`
    : `${totalCount.value}`
)
const devJsonContext = computed(
  () => `collection manager · apps · source: ${props.controller.source}`
)
</script>
