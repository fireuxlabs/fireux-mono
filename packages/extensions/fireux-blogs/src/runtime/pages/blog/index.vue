<!-- fireux-blogs/pages/blog/index.vue -->
<template>
  <UPage>
    <UPageHeader title="Blog" description="Latest articles across FireUX." />
    <UPageBody class="space-y-6">
      <div v-if="pending" class="space-y-3">
        <USkeleton v-for="n in 3" :key="n" class="h-20" />
      </div>

      <template v-else>
        <OrganismsBlogCTA v-if="showCTA" />

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
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'
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
const pending = computed(() => blogPostsCollection.value === undefined)
const posts = computed(() => blogPostsCollection.value ?? [])
const { isAdmin } = useUser()
// Show CTA for admins; in dev, always surface to speed iteration regardless of load state.
const showCTA = computed(() => isAdmin.value || import.meta.dev)
</script>
