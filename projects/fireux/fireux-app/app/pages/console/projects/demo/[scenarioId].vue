<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo, useRoute } from '#imports'
import { useRuntimeProjectSelection } from '~/composables/console/project/state'
import {
  getDemoProjectScenario,
  getDemoProjectScenarioList,
} from '~/composables/console/project/demo-scenarios'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
})

const route = useRoute()
const { setRuntimeProject } = useRuntimeProjectSelection()
const requestedScenarioId = String(route.params.scenarioId || '').trim()
const fallbackScenarioId = String(getDemoProjectScenarioList()[0]?.id || '').trim()
const resolvedScenarioId = getDemoProjectScenario(requestedScenarioId)
  ? requestedScenarioId
  : fallbackScenarioId

if (!resolvedScenarioId) {
  await navigateTo('/console/projects', { replace: true })
} else {
  setRuntimeProject({
    mode: 'demo',
    projectId: resolvedScenarioId,
  })
  await navigateTo('/console/projects', { replace: true })
}
</script>
