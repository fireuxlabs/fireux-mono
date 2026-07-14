<template>
  <AppShell />
  <!-- Path-prefixed auto-import: components/App/Shell.vue -->
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { baerenRinggenbergTheme } from './config/theme.config'

useHead({
  style: [
    {
      key: 'baeren-theme',
      children: baerenRinggenbergTheme.cssVariables,
    },
  ],
})
</script>
