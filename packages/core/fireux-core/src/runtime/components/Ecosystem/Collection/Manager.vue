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
      entity="ecosystems"
      state="loading"
      surface="bare"
    />

    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      entity="ecosystems"
      state="error"
      surface="bare"
      description="Ecosystems could not be loaded. Please try again."
    />

    <EcosystemCollectionList
      v-else-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <EcosystemCardsPill v-bind="card" :link="linkEnabled" />
      </template>
      <template #cell="{ card }">
        <EcosystemCardsCell v-bind="card" :link="linkEnabled" />
      </template>
    </EcosystemCollectionList>

    <MoleculesStateCard
      v-else
      entity="ecosystems"
      state="empty"
      surface="bare"
      :title="query ? 'No ecosystems match your search' : 'No ecosystems yet'"
      :description="query
        ? 'Try a different search term.'
        : 'Once ecosystem records are added, they will display here.'"
    />

    <div>
      <DevJson
        title="Ecosystems (JSON)"
        context="collection manager · ecosystems · directory projection"
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
import { useCollectionSearch } from '../../../composables/shared/useCollectionSearch'
import { useCollectionVariantCards } from '../../../composables/shared/useCollectionVariantCards'
import {
  useEcosystemInterface,
  type EcosystemInterfaceInput,
} from '../../../composables/fireux/firestore/core/ecosystem/utils/view/useEcosystemInterface'
import type { EcosystemDirectoryController } from '../../../models/core/supporting/directory'

const props = withDefaults(
  defineProps<{
    controller: EcosystemDirectoryController
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
    title: 'Ecosystems',
    description: 'Browse ecosystems available in this workspace.',
    link: false,
    searchPlaceholder: 'Search ecosystems…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'cell',
  }
)

const rawCollection = computed<EcosystemInterfaceInput[]>(() =>
  props.controller.ecosystems.value.map((entry) => ({
    ...entry,
    href: entry.detail_url,
    appCount: entry.app_count,
  }))
)
const outcome = computed(() => props.controller.outcome.value)
const isSettled = computed(() =>
  outcome.value === 'ready' || outcome.value === 'empty'
)
const { devJsonData, loadDevJson, unloadDevJson } = useDevCollectionJson(rawCollection)
const title = computed(() => String(props.title || 'Ecosystems'))
const description = computed(() => String(props.description || '').trim())
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search ecosystems…')
)
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = useEcosystemInterface()

const collection = computed<EcosystemInterfaceInput[]>(() =>
  rawCollection.value.filter((row): row is EcosystemInterfaceInput =>
    Boolean(makeCard(row))
  )
)

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<
    EcosystemInterfaceInput,
    NonNullable<ReturnType<typeof makeCard>>
  >({
    items: collection,
    makeCard: (row) => makeCard(row),
    initialVariant: props.initialVariant,
  })

const { cards: cardsFiltered } = useCollectionVariantCards({
  items: visibleItems,
  variant,
  makeCard,
  makePill,
  makeCell,
})

const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)
const countLabel = computed(() =>
  showSearchInput.value && query.value
    ? `${visibleCount.value} / ${totalCount.value}`
    : `${totalCount.value}`
)
</script>
