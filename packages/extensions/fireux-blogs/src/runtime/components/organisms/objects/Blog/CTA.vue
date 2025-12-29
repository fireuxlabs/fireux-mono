<template>
  <UPageCTA
    v-if="showCTA"
    title="Publish a post"
    :description="ctaDescription"
    variant="naked"
  >
    <template #links>
      <UButton color="primary" size="lg" to="/blog/create">
        Draft a post
      </UButton>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBlogPermissions } from '../../../../composables/useBlogPermissions'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

const { canPublishBlog } = useBlogPermissions()
const { appName } = useFireUXConfig()

// Allow admins or users explicitly permitted to publish, and always show in dev to unblock iteration.
const showCTA = computed(() => canPublishBlog.value || import.meta.dev)
const ctaDescription = computed(
  () => `Share updates, releases, and stories for ${appName}.`
)
</script>
please
