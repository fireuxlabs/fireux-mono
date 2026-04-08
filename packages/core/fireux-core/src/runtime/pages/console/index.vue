<template>
  <div />
</template>

<script setup lang="ts">
import { useConsoleEntryCta } from '../../composables/fireux/app/routing/useConsoleEntryCta'

definePageMeta({
  layout: false,
  requiresAuth: true,
})

const { consoleEntryPath } = useConsoleEntryCta()

await navigateTo(consoleEntryPath.value || '/', { replace: true })
</script>
