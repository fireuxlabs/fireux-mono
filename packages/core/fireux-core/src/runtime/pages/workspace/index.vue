<template>
  <div />
</template>

<script setup lang="ts">
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { useWorkspaceEntryCta } from '../../composables/fireux/workspace/useWorkspaceEntryCta'

definePageMeta({
  layout: false,
  requiresAuth: false,
})

const fireux = useFireUXConfig()
const { workspaceEntryPath } = useWorkspaceEntryCta()

await navigateTo(
  fireux.role === 'global' ? '/' : workspaceEntryPath.value || '/',
  { replace: true }
)
</script>
