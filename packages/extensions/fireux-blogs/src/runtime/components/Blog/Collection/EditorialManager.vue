<template>
  <BlogCollectionEditorial
    v-model:query="query"
    :cards="cards"
    :has-more="hasMore"
    :loading-more="loadingMore"
    :load-more-failed="Boolean(loadMoreError)"
    :outcome="outcome"
    :search-enabled="showSearchInput"
    search-placeholder="Search stories…"
    :total-count="totalCount"
    @load-more="loadMore"
    @retry="refresh"
  />
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { computed } from 'vue'
import type { PublicBlogPostIndexProjection } from '../../../models/blogPost-public.model'
import { usePublicBlogCollection } from '../../../composables/fireux/blog/public/usePublicBlogCollection'
import {
  type BlogCard,
  useBlogInterface,
} from '../../../composables/fireux/blog/useBlogInterface'
import BlogCollectionEditorial from './Editorial.vue'

defineOptions({ name: 'BlogCollectionEditorialManager' })

const fetched = usePublicBlogCollection()
const collection = computed<PublicBlogPostIndexProjection[]>(
  () => fetched.collection.value
)
const outcome = computed(() => fetched.outcome.value)
const hasMore = computed(() => fetched.hasMore.value)
const loadingMore = computed(() => fetched.loadingMore.value)
const loadMoreError = computed(() => fetched.loadMoreError.value)
const totalCount = computed(() => fetched.count.value)
const showSearchInput = computed(
  () => !hasMore.value && totalCount.value > 15
)
const loadMore = () => fetched.loadMore()
const refresh = () => fetched.refresh()

const { interface: makeCard } = useBlogInterface()
const { query, visibleItems } = useCollectionSearch<
  PublicBlogPostIndexProjection,
  BlogCard.Card
>({
  items: collection,
  makeCard,
})
const cards = computed<BlogCard.Card[]>(() =>
  visibleItems.value
    .map((post) => makeCard(post))
    .filter((card): card is BlogCard.Card => Boolean(card))
)
</script>
