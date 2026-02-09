<template>
  <BlogCollectionManager :collection="collection" />
</template>

<script setup lang="ts">
import type { BlogPost } from '../../../../../models/blogPost.model';

withDefaults(
  defineProps<{
    collection: BlogPost[]
  }>(),
  {}
)
</script>
