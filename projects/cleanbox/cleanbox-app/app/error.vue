<template>
  <FireuxAppErrorPage :error="error" />
</template>

<script setup lang="ts">
import type { NuxtError } from 'nuxt/app'
import FireuxAppErrorPage from 'fireux-core/runtime/components/App/ErrorPage.vue'

defineProps<{
  error: NuxtError
}>()
</script>
