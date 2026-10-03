<template>
  <article class="space-y-4">
    <header class="space-y-2">
      <p class="text-sm text-muted">{{ authorLine }}</p>
      <h1 class="text-2xl font-semibold leading-tight">{{ post.title }}</h1>
      <p class="text-sm text-toned" v-if="post.metaDescription">
        {{ post.metaDescription }}
      </p>
    </header>

    <div v-if="post.featuredImage" class="rounded-lg overflow-hidden bg-muted">
      <img
        :src="post.featuredImage"
        :alt="post.featuredImageAlt || post.title"
        class="w-full h-auto object-cover"
      />
    </div>

    <section class="prose max-w-none" v-html="safeContent" />
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BlogDetail } from '../../models/blog-directory.model.ts'

const props = defineProps<{ post: BlogDetail }>()

const authorLine = computed(() => {
  const author = props.post.author?.display_name || 'Unknown author'
  const time = props.post.readingTime?.replace(' min', '')
  if (author && time) return `${author} · ${time} min`
  return author
})

const safeContent = computed(() =>
  (props.post.content || '').replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
)
</script>
