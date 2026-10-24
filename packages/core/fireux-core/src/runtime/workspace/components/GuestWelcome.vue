<template>
  <WorkspaceGettingStarted
    v-if="isGuest"
    title="Start with your account"
    description="Sign in or create an account to access your saved work."
    icon="i-lucide-user-round"
  >
    <template #actions>
      <UButton
        :to="{ path: '/auth', query: { redirect: route.fullPath } }"
        label="Sign in"
        icon="i-lucide-log-in"
      />
    </template>
  </WorkspaceGettingStarted>
</template>
<script setup lang="ts">
import { useRoute } from '#imports'
import WorkspaceGettingStarted from './GettingStarted.vue'
import { useWorkspaceEntryState } from '../composables/useWorkspaceEntryState'
const route = useRoute()
const { isGuest } = useWorkspaceEntryState()
</script>
