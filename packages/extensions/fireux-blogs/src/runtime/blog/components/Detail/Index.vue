<template>
  <article>
    <BlogDetailHeader :post="post" />

    <div v-if="post.featuredImage">
      <img
        :src="post.featuredImage"
        :alt="post.featuredImageAlt || post.title"
      />
    </div>

    <section class="prose" v-html="safeContent" />
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
