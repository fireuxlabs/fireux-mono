<template>
  <AppShell />
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { banginCoffeeTheme } from './config/content.config'

useHead({
  style: [
    {
      key: 'bangin-coffee-theme',
      children: banginCoffeeTheme.cssVariables,
    },
  ],
})
</script>
