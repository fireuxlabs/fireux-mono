<template>
  <slot :posts="posts" :total="total" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBlog } from '../../../../../composables/fireux/firestore/objects/blog/useBlog'
import type { BlogPost } from '../../../../../models/objects/blogPost.model'

const { items } = useBlog()

const posts = computed<BlogPost[]>(() => (items.value ?? []) as BlogPost[])
const total = computed(() => posts.value.length)
</script>
