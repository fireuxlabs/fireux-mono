<template>
  <slot :posts="posts" :total="total" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BlogPost } from '../../../../../models/blogPost.model'
import { useBlog } from '../../../../composables/fireux/firestore/blog/useBlog'

const { items } = useBlog()

const posts = computed<BlogPost[]>(() => (items.value ?? []) as BlogPost[])
const total = computed(() => posts.value.length)
</script>
