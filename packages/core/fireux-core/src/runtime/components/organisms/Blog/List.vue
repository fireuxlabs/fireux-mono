<template>
  <div class="blog-list">
    <FireOrganismsBlogCardsCell
      v-for="post in posts"
      :key="post.slug"
      :post="post"
    />
  </div>
</template>

<script setup lang="ts">
import type { BlogPost } from '../../../models/blogPost.model'

defineProps<{ posts: BlogPost[] }>()
</script>

<style>
.blog-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
</style>
