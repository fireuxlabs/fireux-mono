<!-- Concurrent edit — 2026-07-21 14:38 CEST — Company public projection: expose explicit bounded directory pagination. -->
<template>
  <section class="collection-directory company-directory">
    <CollectionDirectoryHeader :title="title" :description="description">
      <template #controls>
        <UInput
          v-if="showSearchInput"
          v-model="query"
          :placeholder="searchPlaceholder"
          :aria-label="searchPlaceholder"
          icon="i-lucide-search"
          class="collection-directory__search"
        />

        <UButton
          v-if="showVariantToggle"
          size="sm"
          color="neutral"
          variant="ghost"
          :icon="variant === 'pill' ? 'i-lucide-layout-grid' : 'i-lucide-list'"
          :aria-label="
            variant === 'pill'
              ? 'Switch to card view'
              : 'Switch to compact view'
          "
          @click="toggleVariant"
        />

        <span
          v-if="showCount && outcome !== 'pending' && outcome !== 'error'"
          class="collection-directory__count"
        >
          {{ countLabel }}
        </span>
      </template>
    </CollectionDirectoryHeader>

    <CollectionDirectoryState
      v-if="outcome === 'pending'"
      title="Loading companies"
      description="Finding companies…"
      icon="i-lucide-loader-circle"
      loading
      role="status"
      aria-live="polite"
      aria-busy="true"
    />

    <CollectionDirectoryState
      v-else-if="outcome === 'error'"
      title="Companies unavailable"
      description="Companies could not be loaded. Please try again."
      icon="i-lucide-triangle-alert"
      role="alert"
      aria-live="assertive"
    >
      <template #actions>
        <UButton
          label="Try again"
          color="neutral"
          variant="soft"
          icon="i-lucide-refresh-cw"
          @click="fetched.refresh"
        />
      </template>
    </CollectionDirectoryState>

    <div v-else-if="cardsFiltered.length" class="grid gap-4">
      <CompanyCollectionList :cards="cardsFiltered" :variant="variant">
        <template #pill="{ card }">
          <CompanyCardsPill v-bind="card" :link="linkEnabled" />
        </template>
        <template #cell="{ card }">
          <CompanyCardsCell v-bind="card" :link="linkEnabled" />
        </template>
      </CompanyCollectionList>

      <UAlert
        v-if="loadMoreError"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        title="More companies could not be loaded"
        description="The companies already shown are still available."
      />

      <div v-if="hasMore" class="flex justify-center">
        <UButton
          label="Load more companies"
          variant="soft"
          color="neutral"
          :loading="loadingMore"
          :disabled="loadingMore"
          @click="handleLoadMore"
        />
      </div>
    </div>

    <CollectionDirectoryState
      v-else
      icon="i-lucide-building-2"
      :title="query ? 'No companies match your search' : 'No companies yet'"
      :description="
        query
          ? 'Try a different search term.'
          : 'Once company records are added, they will display here.'
      "
    />

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
  </section>
</template>

<script setup lang="ts">
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain manager retained.
import { useCollectionVariantCards } from 'fireux-core/runtime/composables/shared/useCollectionVariantCards'
import { computed } from 'vue'
import type { PublicCompanyProjection } from '../../../models/company-public.model.ts'
import { useCompanyCollection } from '../../../composables/company/useCompanyCollection'
import { useCompanyInterface } from '../../../composables/company/useCompanyInterface'

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
    description: 'Browse companies and their business profiles.',
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
  String(props.description || 'Browse companies and their business profiles.')
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
