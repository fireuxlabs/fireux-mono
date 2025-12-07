<!-- app/pages/blog/index.vue -->
<template>
  <UPage>
    <UPageHeader title="Blog" description="Latest articles across FireUX." />
    <UPageBody>
      <div v-if="!posts.length" class="space-y-3">
        <USkeleton v-for="n in 3" :key="n" class="h-20" />
      </div>
      <FireOrganismsBlogList v-else :posts="posts" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBlogPosts } from '../../composables/firestore/objects/Blog/useBlogPosts'

definePageMeta({
  layout: 'default',
  title: 'Blog',
  nav: {
    key: 'blog',
    label: 'Blog',
    icon: 'i-lucide-book',
    order: 30,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})

const { blogPostsCollection } = await useBlogPosts()
const posts = computed(() => blogPostsCollection.value ?? [])
</script>
