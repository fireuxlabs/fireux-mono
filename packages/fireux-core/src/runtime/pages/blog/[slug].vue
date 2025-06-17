<template>
  <div v-if="post" class="page">
    <FireOrganismsBlogCardsPage :post="post" />
  </div>
  <div v-else>
    <h1>404 – Blog post not found</h1>
  </div>
</template>

<script setup>
import { useBlogPosts } from '../../composables/firestore/objects/Blog/useBlogPosts'

const route = useRoute()
const { fetchBlogPost } = await useBlogPosts()

// Fetch the post based on the slug parameter from the URL
const post = fetchBlogPost(route.params.slug)
</script>
