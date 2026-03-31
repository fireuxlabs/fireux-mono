<template>
  <div>Hello world</div>
  <pre>{{ runtimeProjectOverview }}</pre>
</template>

<script setup lang="ts">
import { useRuntimeProjectOverview } from '../../../composables/fireux/app/runtime-project/useRuntimeProjectOverview'

const runtimeProjectOverview = useRuntimeProjectOverview()
</script>
