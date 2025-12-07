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
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'

const { isAdmin, isLoading } = useUser()
const showCTA = computed(() => !isLoading.value && isAdmin.value)
</script>
