<template>
  <UPageCTA
    v-if="showCTA"
    title="Publish a post"
    description="Share updates, releases, and stories for this runtime."
    variant="naked"
  >
    <template #default>
      <p class="text-sm text-gray-600">
        Admins can draft and publish new posts to keep everyone aligned.
      </p>
    </template>

    <template #links>
      <UButton color="primary" size="lg" to="/blog/create">
        Create post
      </UButton>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBlogPermissions } from '#fireux-blogs/composables/useBlogPermissions.ts'

const { canPublishBlog } = useBlogPermissions()

// Allow admins or users explicitly permitted to publish, and always show in dev to unblock iteration.
const showCTA = computed(() => canPublishBlog.value || import.meta.dev)
</script>
