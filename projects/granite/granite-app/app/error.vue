<template>
  <FireuxAppErrorPage :error="error" />
</template>

<script setup lang="ts">
import type { NuxtError } from 'nuxt/app'
import FireuxAppErrorPage from 'fireux-core/runtime/app/components/ErrorPage'

defineProps<{
  error: NuxtError
}>()
</script>
