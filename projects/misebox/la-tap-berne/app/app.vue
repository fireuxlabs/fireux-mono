<template>
  <AppShell />
  <!-- Path-prefixed auto-import: components/App/Shell.vue -->
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { laTapBerneTheme } from './config/theme.config'

useHead({
  style: [
    {
      key: 'latap-theme',
      innerHTML: laTapBerneTheme.cssVariables,
    },
  ],
})
</script>
