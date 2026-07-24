<template>
  <section
    id="blog-stories"
    class="blog-editorial"
    aria-labelledby="blog-stories-title"
  >
    <header class="blog-editorial__header">
      <div>
        <p class="fx-type-headline">Browse the journal</p>
        <p
          id="blog-stories-title"
          class="blog-editorial__title fx-type-section-title"
        >
          Stories, notes and releases
        </p>
      </div>

      <div class="blog-editorial__tools">
        <span class="blog-editorial__count" aria-live="polite">
          {{ storyCountLabel }}
        </span>
        <UInput
          v-if="searchEnabled"
          v-model="searchQuery"
          :placeholder="searchPlaceholder"
          :aria-label="searchPlaceholder"
          icon="i-lucide-search"
          size="lg"
          class="blog-editorial__search"
        />
      </div>
    </header>

    <div
      v-if="outcome === 'pending'"
      class="blog-editorial__loading"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span class="sr-only">Loading stories</span>
      <div class="blog-editorial__lead-skeleton">
        <USkeleton class="blog-editorial__lead-image-skeleton" />
        <div class="blog-editorial__lead-copy-skeleton">
          <USkeleton class="h-5 w-24" />
          <USkeleton class="h-10 w-full" />
          <USkeleton class="h-5 w-4/5" />
          <USkeleton class="h-5 w-3/5" />
        </div>
      </div>

      <div class="blog-editorial__grid">
        <div v-for="index in 3" :key="index" class="blog-editorial__card-skeleton">
          <USkeleton class="aspect-video w-full" />
          <USkeleton class="h-7 w-4/5" />
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-2/3" />
        </div>
      </div>
    </div>

    <div v-else-if="outcome === 'error'" class="blog-editorial__state">
      <MoleculesStateCard
        entity="stories"
        state="error"
        surface="bare"
        title="The journal could not be loaded"
        description="The published stories are temporarily unavailable."
      >
        <UButton
          label="Try again"
          icon="i-lucide-refresh-cw"
          color="neutral"
          variant="soft"
          @click="emit('retry')"
        />
      </MoleculesStateCard>
    </div>

    <div
      v-else-if="totalCount === 0"
      class="blog-editorial__state blog-editorial__state--empty"
    >
      <MoleculesStateCard
        entity="stories"
        state="empty"
        surface="bare"
        :icon="hasMore ? 'i-lucide-book-down' : 'i-lucide-notebook-pen'"
        :title="
          hasMore
            ? 'Continue through the journal'
            : 'The journal is ready for its first story'
        "
        :description="
          hasMore
            ? 'More published stories are available in the catalogue.'
            : 'There are no published stories in this ecosystem yet. Check back soon.'
        "
      >
        <UButton
          v-if="hasMore"
          label="Load more stories"
          icon="i-lucide-plus"
          color="neutral"
          variant="soft"
          :loading="loadingMore"
          @click="emit('load-more')"
        />
      </MoleculesStateCard>
    </div>

    <div
      v-else-if="isSearching && cards.length === 0"
      class="blog-editorial__state"
    >
      <MoleculesStateCard
        entity="stories"
        state="empty"
        surface="bare"
        title="No stories match your search"
        description="Try another phrase or clear the search to browse every story."
      >
        <UButton
          label="Clear search"
          icon="i-lucide-x"
          color="neutral"
          variant="soft"
          @click="searchQuery = ''"
        />
      </MoleculesStateCard>
    </div>

    <div v-else class="blog-editorial__content">
      <UBlogPosts
        v-if="isSearching"
        as="ul"
        orientation="horizontal"
        class="blog-editorial__grid"
      >
        <li v-for="card in cards" :key="card.id">
          <BlogCardsStory v-bind="card" />
        </li>
      </UBlogPosts>

      <template v-else>
        <BlogCardsStory
          v-if="leadCard"
          v-bind="leadCard"
          lead
        />

        <div v-if="remainingCards.length" class="blog-editorial__more">
          <p class="fx-type-label">More from the journal</p>
          <UBlogPosts
            as="ul"
            orientation="horizontal"
            class="blog-editorial__grid"
          >
            <li v-for="card in remainingCards" :key="card.id">
              <BlogCardsStory v-bind="card" />
            </li>
          </UBlogPosts>
        </div>
      </template>

      <div
        v-if="hasMore || loadMoreFailed"
        class="blog-editorial__pagination"
      >
        <p v-if="loadMoreFailed" role="alert" class="blog-editorial__load-error">
          More stories could not be loaded. You can try again.
        </p>
        <UButton
          v-if="hasMore"
          label="Load more stories"
          icon="i-lucide-plus"
          color="neutral"
          variant="soft"
          size="lg"
          :loading="loadingMore"
          @click="emit('load-more')"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BlogCard } from '../../../composables/fireux/firestore/blog/utils/view/useBlogInterface'
import BlogCardsStory from '../Cards/Story.vue'

defineOptions({ name: 'BlogCollectionEditorial' })

const props = withDefaults(
  defineProps<{
    cards: BlogCard.Card[]
    hasMore?: boolean
    loadingMore?: boolean
    loadMoreFailed?: boolean
    outcome: 'pending' | 'error' | 'ready' | 'empty'
    query?: string
    searchEnabled?: boolean
    searchPlaceholder?: string
    totalCount?: number
  }>(),
  {
    cards: () => [],
    hasMore: false,
    loadingMore: false,
    loadMoreFailed: false,
    query: '',
    searchEnabled: false,
    searchPlaceholder: 'Search stories…',
    totalCount: 0,
  }
)

const emit = defineEmits<{
  (event: 'load-more'): void
  (event: 'retry'): void
  (event: 'update:query', value: string): void
}>()

const searchQuery = computed({
  get: () => props.query,
  set: (value: string) => emit('update:query', value),
})
const isSearching = computed(() => Boolean(props.query.trim()))
const leadCard = computed(() => props.cards[0] ?? null)
const remainingCards = computed(() => props.cards.slice(1))
const storyCountLabel = computed(() => {
  const count = props.totalCount
  const suffix = props.hasMore ? '+' : ''
  return `${count}${suffix} ${count === 1 && !props.hasMore ? 'story' : 'stories'}`
})
</script>

<style scoped>
.blog-editorial {
  display: grid;
  gap: clamp(
    calc(var(--spacing) * 8),
    5vw,
    calc(var(--spacing) * 14)
  );
  scroll-margin-top: calc(var(--spacing) * 20);
}

.blog-editorial__header {
  align-items: end;
  border-bottom: 1px solid var(--ui-border);
  display: grid;
  gap: calc(var(--spacing) * 6);
  padding-bottom: calc(var(--spacing) * 6);
}

.blog-editorial__title {
  margin: calc(var(--spacing) * 2) 0 0;
}

.blog-editorial__tools {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 3);
}

.blog-editorial__count {
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  min-width: max-content;
}

.blog-editorial__search {
  flex: 1 1 calc(var(--spacing) * 60);
  min-width: min(100%, calc(var(--spacing) * 56));
}

.blog-editorial__content,
.blog-editorial__more,
.blog-editorial__loading {
  display: grid;
  gap: clamp(
    calc(var(--spacing) * 8),
    5vw,
    calc(var(--spacing) * 14)
  );
}

.blog-editorial__grid {
  list-style: none;
  margin: 0;
  padding: 0;
}

.blog-editorial__grid > li {
  min-width: 0;
}

.blog-editorial__state {
  align-items: center;
  background:
    radial-gradient(
      circle at 50% 0%,
      color-mix(in srgb, var(--ui-primary) 10%, transparent),
      transparent 48%
    ),
    var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 4);
  display: flex;
  min-height: calc(var(--spacing) * 72);
  padding: calc(var(--spacing) * 8);
}

.blog-editorial__state--empty {
  border-color: color-mix(in srgb, var(--ui-primary) 22%, var(--ui-border));
}

.blog-editorial__lead-skeleton {
  background: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 3);
  display: grid;
  gap: calc(var(--spacing) * 6);
  overflow: hidden;
  padding: calc(var(--spacing) * 4);
}

.blog-editorial__lead-image-skeleton {
  aspect-ratio: 16 / 9;
  width: 100%;
}

.blog-editorial__lead-copy-skeleton,
.blog-editorial__card-skeleton {
  display: grid;
  gap: calc(var(--spacing) * 3);
}

.blog-editorial__card-skeleton {
  background: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 3);
  overflow: hidden;
  padding: calc(var(--spacing) * 4);
}

.blog-editorial__pagination {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 3);
  justify-content: center;
  padding-top: calc(var(--spacing) * 4);
}

.blog-editorial__load-error {
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
  margin: 0;
  text-align: center;
}

@media (min-width: 40rem) {
  .blog-editorial__header {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .blog-editorial__tools {
    justify-content: flex-end;
  }

  .blog-editorial__search {
    width: calc(var(--spacing) * 72);
  }

  .blog-editorial__lead-skeleton {
    align-items: center;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
}
</style>
