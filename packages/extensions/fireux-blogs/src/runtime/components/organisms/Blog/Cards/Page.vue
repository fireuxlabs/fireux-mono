<template>
  <div class="page-card">
    <h1>{{ post?.title }}</h1>
    <article v-html="post?.content" />
  </div>
</template>

<script setup>
defineProps({
  post: {
    type: Object,
    default: () => ({}),
  },
})
</script>
