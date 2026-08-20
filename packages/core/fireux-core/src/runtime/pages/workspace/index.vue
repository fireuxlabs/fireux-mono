<template>
  <div />
</template>

<script setup lang="ts">
import { useWorkspaceEntryCta } from '../../composables/fireux/workspace/useWorkspaceEntryCta'

definePageMeta({
  layout: false,
  requiresAuth: true,
})

const { workspaceEntryPath } = useWorkspaceEntryCta()

await navigateTo(workspaceEntryPath.value || '/', { replace: true })
</script>
