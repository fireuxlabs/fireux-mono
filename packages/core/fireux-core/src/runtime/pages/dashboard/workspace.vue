<template>
  <div />
</template>

<script setup lang="ts">
import { useWorkspaceEntryCta } from '../../composables/fireux/workspace/useWorkspaceEntryCta'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-workspace',
    label: 'Workspace',
    icon: 'i-lucide-square-terminal',
    position: 'middle',
    order: 30,
    desktop: true,
    mobile: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
  roles: ['admin'],
})

const { hasWorkspaceEntry, workspaceEntryPath, workspaceRootPath } = useWorkspaceEntryCta()

await navigateTo(
  hasWorkspaceEntry.value ? workspaceEntryPath.value : workspaceRootPath,
  { replace: true }
)
</script>
