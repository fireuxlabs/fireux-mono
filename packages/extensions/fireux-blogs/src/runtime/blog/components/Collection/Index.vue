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
            <UBadge v-if="showCount" variant="soft">{{ countLabel }}</UBadge>
          </div>
        </div>
      </div>
    </template>

    <BlogCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <BlogCardsPill v-bind="card" :link="linkEnabled" />
      </template>
      <template #cell="{ card }">
        <BlogCardsCell v-bind="card" :link="linkEnabled" />
      </template>
    </BlogCollectionList>

    <MoleculesStateCard
      v-else
      entity="posts"
      state="empty"
      surface="bare"
      :title="query ? 'No posts match your search' : 'No posts yet'"
      :description="
        query
          ? 'Try a different search term.'
          : 'Once posts are published, they will display here.'
      "
    />

    <div>
      <DiagnosticsDebugPanel
        object-origin="fetched"
        launcher
        include-route
        :title="'Blog (JSON)'"
        :context="devJsonContext"
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
import { useDiagnosticsCollectionJson } from 'fireux-core/runtime/composables/diagnostics/useDiagnosticsCollectionJson'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain manager retained.
import { useCollectionVariantCards } from 'fireux-core/runtime/composables/shared/useCollectionVariantCards'
import { computed } from 'vue'
import type { BlogPost } from '../../utils/blog-post'
import { useBlogInterface } from '../../composables/useBlogInterface'

const props = withDefaults(
  defineProps<{
    posts: BlogPost[]
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
    title: 'Blog',
    description: 'Browse published blog posts for this runtime.',
    link: true,
    searchPlaceholder: 'Search posts…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
  }
)

const collection = computed<BlogPost[]>(() => props.posts)
const { devJsonData, loadDevJson, unloadDevJson } =
  useDiagnosticsCollectionJson(collection)
const title = computed(() => String(props.title || 'Blog'))
const description = computed(() =>
  String(props.description || 'Browse published blog posts for this runtime.')
)
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search posts…')
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
} = useBlogInterface()

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<BlogPost, NonNullable<ReturnType<typeof makeCard>>>({
    items: collection,
    makeCard: (post: BlogPost) => makeCard(post),
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
const devJsonContext = 'collection presentation · blogs · root: blogs'
</script>
