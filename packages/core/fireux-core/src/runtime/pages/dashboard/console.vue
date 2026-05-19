<template>
  <div />
</template>

<script setup lang="ts">
import { useConsoleEntryCta } from '../../composables/fireux/app/ui/nav/useConsoleEntryCta'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-console',
    label: 'Console',
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

const { hasConsoleEntry, consoleEntryPath, consoleRootPath } = useConsoleEntryCta()

await navigateTo(
  hasConsoleEntry.value ? consoleEntryPath.value : consoleRootPath,
  { replace: true }
)
</script>
