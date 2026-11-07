<template>
  <header>
    <p>{{ authorLine }}</p>
    <h1 class="fx-type-page-title">{{ post.title }}</h1>
    <p v-if="post.metaDescription">
      {{ post.metaDescription }}
    </p>
  </header>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { BlogDetail } from '../../models/blog-directory.model'
const props = defineProps<{ post: BlogDetail }>()
const authorLine = computed(() => {
  const author = props.post.author?.display_name || 'Unknown author'
  const time = props.post.readingTime?.replace(' min', '')
  if (author && time) return `${author} · ${time} min`
  return author
})
</script>
