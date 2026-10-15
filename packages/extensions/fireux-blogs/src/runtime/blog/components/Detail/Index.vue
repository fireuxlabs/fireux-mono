<template>
  <article class="space-y-4">
    <BlogDetailHeader :post="post" />

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

const safeContent = computed(() =>
  (props.post.content || '').replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
)
</script>
