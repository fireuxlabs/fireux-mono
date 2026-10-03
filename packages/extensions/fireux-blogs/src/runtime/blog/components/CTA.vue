<template>
  <UButton
    v-if="showCTA"
    class="cta"
    data-entity-cta-family="admin-managed"
    color="primary"
    size="lg"
    to="/dashboard/admin/blogs/create"
    label="Write a post"
    icon="i-lucide-pen-line"
    :aria-label="`Write a post for ${appName}`"
  />
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { computed } from 'vue'
import { useBlogPermissions } from '../composables/useBlogPermissions'

const { canPublishBlog } = useBlogPermissions()
const { appName } = useFireUXConfig()

const showCTA = computed(() => canPublishBlog.value)
</script>
