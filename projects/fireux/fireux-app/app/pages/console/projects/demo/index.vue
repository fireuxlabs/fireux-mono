<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { useRuntimeProjectSelection } from '~/composables/console/project/state'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
})

const { setRuntimeProject } = useRuntimeProjectSelection()
setRuntimeProject({
  mode: 'demo',
})
await navigateTo('/console/projects', { replace: true })
</script>
