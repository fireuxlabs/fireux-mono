<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { useRuntimeProjectSelection } from '../../../../composables/fireux/app/runtime-project/state'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
})

const { setRuntimeProject } = useRuntimeProjectSelection()
setRuntimeProject({
  mode: 'read-only',
  projectId: '',
})
await navigateTo('/console/projects/overview', { replace: true })
</script>
