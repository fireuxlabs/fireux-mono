<template>
  <UPageCTA
    class="fx-cta"
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

const showCTA = computed(() => canPublishBlog.value)
const ctaDescription = computed(
  () => `Share updates, releases, and stories for ${appName}.`
)
</script>
