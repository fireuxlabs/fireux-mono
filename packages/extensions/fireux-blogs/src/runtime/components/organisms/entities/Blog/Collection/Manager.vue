<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>Blog</div>
          <p>Browse posts available to this runtime.</p>
        </div>

        <div class="collection-manager__controls">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search posts…"
          />

          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>
          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

      <ClientOnly>
        <OrganismsEntitiesBlogCollectionList
          v-if="cardsFiltered.length"
          :cards="cardsFiltered"
          :variant="variant"
        >
          <template #pill="{ card }">
            <component :is="card.to ? 'NuxtLink' : 'div'" :to="card.to || undefined">
              <BlogCardsPill v-bind="card" />
            </component>
          </template>
          <template #cell="{ card }">
            <component :is="card.to ? 'NuxtLink' : 'div'" :to="card.to || undefined">
              <BlogCardsCell v-bind="card" />
            </component>
          </template>
        </OrganismsEntitiesBlogCollectionList>

        <p v-else>
          {{ query ? 'No posts match your search.' : 'No posts found.' }}
        </p>
      </ClientOnly>

    <div v-if="isDev">
      <DevJson
        :title="'Blog (JSON)'"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { computed } from 'vue';
import { useBlogInterface } from '../../../../../composables/fireux/firestore/objects/blog/utils/view/useBlogInterface';
import type { BlogPost } from '../../../../../models/objects/blogPost.model';

const props = defineProps<{ collection?: BlogPost[] }>()

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
</script>
