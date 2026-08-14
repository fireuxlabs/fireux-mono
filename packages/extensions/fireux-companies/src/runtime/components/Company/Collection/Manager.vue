<!-- Concurrent edit — 2026-07-21 14:38 CEST — Company public projection: expose explicit bounded directory pagination. -->
<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
        </div>

        <div class="collection-manager__controls">
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
            <UBadge
              v-if="showCount && outcome !== 'pending' && outcome !== 'error'"
              variant="soft"
              >{{ countLabel }}</UBadge
            >
          </div>
        </div>
      </div>
    </template>

    <MoleculesStateCard
      v-if="outcome === 'pending'"
      entity="companies"
      state="loading"
      surface="bare"
    />

    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      entity="companies"
      state="error"
      surface="bare"
    />

    <CompanyCollectionList
      v-else-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <CompanyCardsPill v-bind="card" :link="linkEnabled" />
      </template>
      <template #cell="{ card }">
        <CompanyCardsCell v-bind="card" :link="linkEnabled" />
      </template>
    </CompanyCollectionList>

    <MoleculesStateCard
      v-else
      entity="companies"
      state="empty"
      surface="bare"
      :title="query ? 'No companies match your search' : 'No companies yet'"
      :description="
        query
          ? 'Try a different search term.'
          : 'Once company records are added, they will display here.'
      "
    />

    <div v-if="hasMore" class="mt-4 flex justify-center">
      <UButton
        size="xs"
        variant="soft"
        color="neutral"
        :loading="loadingMore"
        :disabled="loadingMore"
        @click="handleLoadMore"
      >
        Load more companies
      </UButton>
    </div>

    <p v-if="loadMoreError" class="mt-2 text-center text-sm text-error">
      More companies could not be loaded.
    </p>

    <div>
<DevDebugPanel
  object-origin="fetched"
        launcher
        include-route
        :title="'Companies (JSON)'"
        context="collection manager · companies"
        :objects="devJsonData"
  :derived="{}"
        :default-open="false"
        @opened="loadDevJson"
        @closed="unloadDevJson"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain manager retained.
import { useCollectionVariantCards } from 'fireux-core/runtime/composables/shared/useCollectionVariantCards'
import { computed } from 'vue'
import type { PublicCompanyProjection } from '../../../models/company-public.model'
import { useCompanyCollection } from '../../../composables/fireux/company/useCompanyCollection'
import { useCompanyInterface } from '../../../composables/fireux/company/useCompanyInterface'

const props = withDefaults(
  defineProps<{
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
    title: 'Companies',
    description: 'Browse company records built on claimed places.',
    link: true,
    searchPlaceholder: 'Search companies…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
  }
)

const fetched = useCompanyCollection<PublicCompanyProjection>()
const collection = computed<PublicCompanyProjection[]>(
  () => fetched.collection.value ?? []
)
const outcome = computed(() => fetched.outcome.value)
const hasMore = computed(() => fetched.hasMore.value)
const loadingMore = computed(() => fetched.loadingMore.value)
const loadMoreError = computed(() => fetched.loadMoreError.value)
async function handleLoadMore(): Promise<void> {
  await fetched.loadMore()
}
const { devJsonData, loadDevJson, unloadDevJson } =
  useDevCollectionJson(collection)
const title = computed(() => String(props.title || 'Companies'))
const description = computed(() =>
  String(props.description || 'Browse company records built on claimed places.')
)
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search companies…')
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
} = useCompanyInterface()

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<
    PublicCompanyProjection,
    NonNullable<ReturnType<typeof makeCard>>
  >({
    items: collection,
    makeCard: (company: PublicCompanyProjection) => makeCard(company),
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
</script>
