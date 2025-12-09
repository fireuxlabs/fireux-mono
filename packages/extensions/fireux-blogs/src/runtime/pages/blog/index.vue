<!-- fireux-blogs/pages/blog/index.vue -->
<template>
  <UPage>
    <UPageHeader title="Blog" description="Latest Misebox articles." />
    {{canPublishBlog}}
    <UPageBody class="space-y-6">
      <div v-if="pending" class="space-y-3">
        <USkeleton v-for="n in 3" :key="n" class="h-20" />
      </div>

      <template v-else>
        <OrganismsBlogCTA v-if="canPublishBlog" />

        <div v-if="!posts.length" class="space-y-2 text-sm text-gray-500">
          <p>No posts published yet.</p>
          <p>Check back soon for new articles.</p>
        </div>

        <OrganismsBlogList v-else :posts="posts" />
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBlog } from '../../composables/fireux/firestore/objects/Blog/useBlog'
import { useBlogPermissions } from '#fireux-blogs/composables/useBlogPermissions'

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

const { items } = useBlog()
const pending = computed(() => items.value === undefined)
const posts = computed(() => items.value ?? [])
const { canPublishBlog } = useBlogPermissions()
</script>
