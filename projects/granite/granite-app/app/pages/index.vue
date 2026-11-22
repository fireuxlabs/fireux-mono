<template>
  <UMain><div /></UMain>
</template>
<script setup lang="ts">
import { useWorkspaceEntryCta } from 'fireux-workspace/runtime/workspace/composables/useWorkspaceEntryCta'
definePageMeta({ layout: false, pageTransition: false, requiresAuth: false })
const route = useRoute()
const { workspaceEntryPath } = useWorkspaceEntryCta()
await navigateTo(
  { path: workspaceEntryPath.value, query: route.query, hash: route.hash },
  { redirectCode: 302, replace: true }
)
</script>
