<!-- Concurrent edit — 2026-07-21 13:52 CEST — CSS necessity pass: use Nuxt UI columns for the shared profile editor. -->
<template>
  <UPageColumns class="min-w-0 columns-1 lg:columns-2">
    <slot name="preview" />
    <slot name="core" />
    <slot v-if="isTenant" name="app" />
  </UPageColumns>
</template>

<script setup lang="ts">
import { useFireUXConfig } from '../../../composables/fireux/app/FireUXConfig'

const { isTenant } = useFireUXConfig()
</script>
