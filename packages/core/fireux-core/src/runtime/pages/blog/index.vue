<!-- app/pages/blog/index.vue -->
<template>
  <div class="page">
    <h1>Blog</h1>
    <p>Welcome to our blog. Stay tuned for updates!</p>
    {{ posts }}
  </div>
</template>

<script setup lang="ts">
import { useBlogPosts } from '../../composables/firestore/objects/Blog/useBlogPosts'

definePageMeta({
  nav: {
    key: 'blog',
    label: 'Blog',
    icon: 'i-lucide-book',
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})

// blogPostsCollection is already a Ref<BlogPost[]>
const { blogPostsCollection: posts } = await useBlogPosts()
</script>
