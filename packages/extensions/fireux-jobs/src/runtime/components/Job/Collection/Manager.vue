<!-- Concurrent edit — 2026-07-22 12:39 CEST — Shared Job UI alignment: use shared public-directory chrome and truthful projected outcomes. -->
<template>
  <section id="open-jobs" class="collection-directory job-directory">
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
          :aria-label="variant === 'pill'
            ? 'Switch to card view'
            : 'Switch to compact view'"
          @click="toggleVariant"
        />

        <span v-if="showCount && isSettled" class="collection-directory__count">
          {{ countLabel }}
        </span>
      </template>
    </CollectionDirectoryHeader>

    <CollectionDirectoryState
      v-if="outcome === 'pending'"
      title="Loading jobs"
      description="Finding published jobs…"
      icon="i-lucide-loader-circle"
      loading
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-atomic="true"
    />

    <CollectionDirectoryState
      v-else-if="outcome === 'error'"
      title="Jobs unavailable"
      description="Published jobs could not be loaded. Please try again."
      icon="i-lucide-triangle-alert"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    />

    <div v-else-if="cardsFiltered.length">
      <JobCollectionList :cards="cardsFiltered" :variant="variant">
        <template #pill="{ card }">
          <JobCardsPill
            v-bind="card"
            :link="linkEnabled"
            :show-badges="showBadges"
          />
        </template>
        <template #cell="{ card }">
          <JobCardsCell
            v-bind="card"
            :link="linkEnabled"
            :show-badges="showBadges"
          />
        </template>
      </JobCollectionList>

      <div v-if="hasMore">
        <UButton
          label="Load more jobs"
          color="neutral"
          variant="soft"
          :loading="loadingMore"
          @click="onLoadMore"
        />
      </div>
    </div>

    <div v-else>
      <CollectionDirectoryState
        icon="i-lucide-briefcase-business"
        :title="query
          ? 'No matching jobs'
          : hasMore
            ? 'More published jobs may be available'
            : 'No published jobs yet'"
        :description="query
          ? 'Try a different role, employer, or location.'
          : hasMore
            ? 'Continue through the bounded directory to check the remaining listings.'
            : 'Published opportunities will appear here when employers make them public.'"
      >
        <template v-if="!query && !hasMore" #actions>
          <UButton
            to="/jobs/manage"
            label="Post the first job"
            icon="i-lucide-circle-plus"
          />
          <UButton
            to="/jobs/learn-more"
            label="See how it works"
            icon="i-lucide-arrow-right"
            color="neutral"
            variant="soft"
          />
        </template>
      </CollectionDirectoryState>

      <div v-if="hasMore && !query">
        <UButton
          label="Check more jobs"
          color="neutral"
          variant="soft"
          :loading="loadingMore"
          @click="onLoadMore"
        />
      </div>
    </div>

    <UAlert
      v-if="loadMoreError"
      color="error"
      variant="soft"
      title="More jobs could not be loaded"
      description="Please try again."
    />

    <div>
      <DevJson
        title="Jobs (Public JSON)"
        context="collection manager · jobs · bounded public projection"
        :data="devJsonData"
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
import { useCollectionVariantCards } from 'fireux-core/runtime/composables/shared/useCollectionVariantCards'
import { computed } from 'vue'
import type { PublicJobProjection } from '../../../models/job-public.model'
import { usePublicJobCollection } from '../../../composables/fireux/jobs/public/usePublicJobCollection'
import { useJobInterface } from '../../../composables/fireux/firestore/jobs/utils/view/useJobInterface'

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    link?: boolean
    searchPlaceholder?: string
    showSearch?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    showBadges?: boolean
    initialVariant?: 'pill' | 'cell'
  }>(),
  {
    title: 'Open opportunities',
    description: 'Explore roles, meet the employer, and understand the work before you apply.',
    link: true,
    searchPlaceholder: 'Search jobs…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    showBadges: true,
    initialVariant: 'cell',
  }
)

const fetched = usePublicJobCollection()
const collection = computed<PublicJobProjection[]>(() => fetched.jobs.value)
const outcome = computed(() => fetched.outcome.value)
const hasMore = computed(() => fetched.hasMore.value)
const loadingMore = computed(() => fetched.loadingMore.value)
const loadMoreError = computed(() => fetched.loadMoreError.value)
const onLoadMore = (): void => {
  void fetched.loadMore()
}
const isSettled = computed(() =>
  outcome.value === 'ready' || outcome.value === 'empty'
)
const { devJsonData, loadDevJson, unloadDevJson } = useDevCollectionJson(collection)
const title = computed(() => String(props.title || 'Jobs'))
const description = computed(() => String(
  props.description || 'Choose a published job to review its details.'
))
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() => String(props.searchPlaceholder || 'Search jobs…'))
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const showBadges = computed(() => props.showBadges !== false)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && !hasMore.value && totalCount.value > 15
)
const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = useJobInterface()

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<
    PublicJobProjection,
    NonNullable<ReturnType<typeof makeCard>>
  >({
    items: collection,
    makeCard: job => makeCard(job),
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
    ? `${visibleCount.value} of ${totalCount.value} jobs`
    : `${totalCount.value}${hasMore.value ? '+' : ''} job${totalCount.value === 1 ? '' : 's'}`
)
</script>
