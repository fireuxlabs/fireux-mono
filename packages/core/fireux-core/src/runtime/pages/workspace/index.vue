<template>
  <div />
</template>

<script setup lang="ts">
import { useWorkspaceEntryCta } from '../../workspace/composables/useWorkspaceEntryCta'

definePageMeta({
  layout: false,
  requiresAuth: false,
})

const { workspaceEntryPath } = useWorkspaceEntryCta()

await navigateTo(workspaceEntryPath.value, { replace: true })
</script>
