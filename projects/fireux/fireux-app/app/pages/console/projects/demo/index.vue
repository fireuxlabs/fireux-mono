<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { useProjectSelection } from '~/composables/console/project/useProjectSelection'

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
