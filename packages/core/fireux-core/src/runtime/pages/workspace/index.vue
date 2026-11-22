<template>
  <UMain>
    <div />
  </UMain>
</template>

<script setup lang="ts">
import { useWorkspaceEntryCta } from '../../workspace/composables/useWorkspaceEntryCta'

definePageMeta({
  layout: false,
  requiresAuth: false,
  nav: {
    key: 'workspace-entry',
    label: 'Workspace',
    icon: 'i-lucide-panels-top-left',
    menus: ['default', 'landing'],
    visibility: { modules: ['fireux-workspace'] },
  },
})

const { openWorkspace } = useWorkspaceEntryCta()

await openWorkspace({}, { replace: true })
</script>
