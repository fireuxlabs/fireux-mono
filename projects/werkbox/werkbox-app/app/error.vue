<!-- Concurrent edit — 2026-07-21 12:17 CEST — Cleanbox-to-Werkbox app migration: add the canonical app error boundary. -->
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
