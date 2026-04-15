<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { getDefaultDemoProjectScenario } from 'fireux-core/runtime/composables/fireux/app/project-console/demo-scenarios'
import { useProjectSelection } from 'fireux-core/runtime/composables/fireux/app/project-console/useProjectSelection'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
})

const scenario = getDefaultDemoProjectScenario()
const { setRuntimeProject } = useProjectSelection()

setRuntimeProject({
  mode: 'demo',
  projectId: scenario.id,
})

await navigateTo('/console/projects', { replace: true })
</script>
