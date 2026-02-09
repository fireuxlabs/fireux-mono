<template>
  <article class="space-y-4">
    <header class="space-y-2">
      <p class="text-sm text-gray-500">{{ authorLine }}</p>
      <h1 class="text-2xl font-semibold leading-tight">{{ post.title }}</h1>
      <p class="text-sm text-gray-600" v-if="post.metaDescription">
        {{ post.metaDescription }}
      </p>
    </header>

    <div v-if="post.featuredImage" class="rounded-lg overflow-hidden bg-gray-100">
      <img
        :src="post.featuredImage"
        :alt="post.title"
        class="w-full h-auto object-cover"
      />
    </div>

    <section class="prose max-w-none" v-html="safeContent" />
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BlogPost } from '../../../../../models/blogPost.model'

const props = defineProps<{ post: BlogPost }>()

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
