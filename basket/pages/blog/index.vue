<!-- app/pages/blog/index.vue -->
<template>
  <div class="page">
    <h1>Blog</h1>
    <p>Welcome to our blog. Stay tuned for updates!</p>
    {{ posts }}
    <!-- <OrganismsBlogList :posts="posts" /> -->
  </div>
</template>

<script setup lang="ts">
// blogPostsCollection is already a Ref<BlogPost[]>
const { blogPostsCollection: posts } = useBlogPosts()
</script>
