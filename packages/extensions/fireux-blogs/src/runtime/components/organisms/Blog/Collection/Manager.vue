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

    <p v-else>
      {{ query ? 'No posts match your search.' : 'No posts found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        :title="'Blog (JSON)'"
        :context="devJsonContext"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { computed } from 'vue';
import type { BlogPost } from '../../../../../models/blogPost.model';
import { useBlogInterface } from '../../../../composables/fireux/firestore/blog/utils/view/useBlogInterface';

const props = withDefaults(
  defineProps<{
    collection?: BlogPost[]
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

const collection = computed(() => props.collection ?? [])
const title = computed(() => String(props.title || 'Blog'))
const description = computed(
  () => String(props.description || 'Browse published blog posts for this runtime.')
)
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() => String(props.searchPlaceholder || 'Search posts…'))
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(() => showSearch.value && totalCount.value > 15)
const { card: makeCard, searchText } = useBlogInterface()

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<BlogPost, ReturnType<typeof makeCard>>({
  items: collection,
  searchText: (post: BlogPost) => searchText(post),
  makeCard: (post: BlogPost) => makeCard(post),
  initialVariant: props.initialVariant,
})
const isDev = import.meta.dev
const devJsonContext = 'collection manager · blogs · root: blogs'
</script>
