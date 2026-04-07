<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { useProjectSelection } from 'fireux-core/runtime/composables/fireux/app/project-console/useProjectSelection'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
})

const { setRuntimeProject } = useProjectSelection()
setRuntimeProject({
  mode: 'demo',
})
await navigateTo('/console/projects', { replace: true })
</script>
