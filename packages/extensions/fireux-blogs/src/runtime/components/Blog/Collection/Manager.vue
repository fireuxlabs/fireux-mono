<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
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
      entity="posts"
      state="loading"
      surface="bare"
    />

    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      entity="posts"
      state="error"
      surface="bare"
    />

    <BlogCollectionList
      v-else-if="cardsFiltered.length"
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
      <DevJson
        :title="'Blog (JSON)'"
        :context="devJsonContext"
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
import type { BlogPost } from '../../../models/blogPost.model'
import { useBlogCollection } from '../../../composables/fireux/firestore/blog/fetch/useBlogCollection'
import { useBlogInterface } from '../../../composables/fireux/firestore/blog/utils/view/useBlogInterface'

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

const fetched = useBlogCollection()
const collection = computed<BlogPost[]>(() => fetched.collection.value)
const outcome = computed(() => fetched.outcome.value)
const { devJsonData } = useDevCollectionJson(collection)
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

const cardsFiltered = computed<NonNullable<ReturnType<typeof makeCard>>[]>(() =>
  visibleItems.value
    .map((post) => {
      if (variant.value === 'cell') {
        const base = makeCard(post)
        const cell = makeCell(post)
        if (!base || !cell) return null
        return { ...base, ...cell }
      }

      return makePill(post)
    })
    .filter((card): card is NonNullable<ReturnType<typeof makeCard>> =>
      Boolean(card)
    )
)
const countLabel = computed(() =>
  showSearchInput.value && query.value
    ? `${visibleCount.value} / ${totalCount.value}`
    : `${totalCount.value}`
)
const devJsonContext = 'collection manager · blogs · root: blogs'
</script>
