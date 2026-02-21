<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>Blog</div>
          <p>Browse {{ appName }} posts.</p>
        </div>

        <div class="collection-manager__controls">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search posts…"
          />

          <UButton
            size="xs"
            variant="ghost"
            :icon="variant === 'pill' ? 'i-lucide-list' : 'i-lucide-layout-grid'"
            :aria-label="variant === 'pill' ? 'Switch to list view' : 'Switch to grid view'"
            @click="toggleVariant"
          />
          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <BlogCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <NuxtLink :to="card.to">
          <BlogCardsPill v-bind="card" />
        </NuxtLink>
      </template>
      <template #cell="{ card }">
        <NuxtLink :to="card.to">
          <BlogCardsCell v-bind="card" />
        </NuxtLink>
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
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig';
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { computed } from 'vue';
import type { BlogPost } from '../../../../../models/blogPost.model';
import { useBlogInterface } from '../../../../composables/fireux/firestore/blog/utils/view/useBlogInterface';

const props = defineProps<{ collection?: BlogPost[] }>()
const { appName } = useFireUXConfig()

const collection = computed(() => props.collection ?? [])
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
})
const totalCount = computed(() => collection.value.length)
const isDev = import.meta.dev
const devJsonContext = 'collection manager · blogs · root: blogs'
</script>
