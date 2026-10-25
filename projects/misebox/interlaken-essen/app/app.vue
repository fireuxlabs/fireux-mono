<template>
  <UApp>
    <Workspace v-if="$route.meta.workspacePage" />
    <NuxtLayout v-else>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'

const { locale } = useInterlakenCopy()

useHead(() => ({
  htmlAttrs: {
    lang: locale.value,
  },
}))
</script>
