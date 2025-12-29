<template>
  <UCard class="fx-section">
    <template #header>
      <div class="fx-section__header">
        <div class="fx-section__copy">
          <h2 class="text-base font-semibold">Latest Posts</h2>
        </div>
        <UBadge variant="soft">{{ postsList.length }} posts</UBadge>
      </div>
    </template>

    <div v-if="postsList.length" class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <OrganismsObjectsBlogCardsArticle
        v-for="post in postsList"
        :key="post.slug"
        :post="post"
      />
    </div>

    <p v-else class="text-sm text-gray-500">No posts published yet.</p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BlogPost } from '../../../../models/objects/blogPost.model'

const props = defineProps<{ posts: BlogPost[] }>()

const postsList = computed(() => props.posts || [])
</script>
