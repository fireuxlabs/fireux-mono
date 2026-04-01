<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo, useRoute } from '#imports'
import { useRuntimeProjectSelection } from '~/composables/console/project/state'
import {
  getReadOnlyProjectScenario,
  getReadOnlyProjectScenarioList,
} from '~/composables/console/project/read-only-scenarios'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
})

const route = useRoute()
const { setRuntimeProject } = useRuntimeProjectSelection()
const requestedScenarioId = String(route.params.scenarioId || '').trim()
const fallbackScenarioId = String(getReadOnlyProjectScenarioList()[0]?.id || '').trim()
const resolvedScenarioId = getReadOnlyProjectScenario(requestedScenarioId)
  ? requestedScenarioId
  : fallbackScenarioId

if (!resolvedScenarioId) {
  await navigateTo('/console/projects', { replace: true })
} else {
  setRuntimeProject({
    mode: 'read-only',
    projectId: resolvedScenarioId,
  })
  await navigateTo('/console/projects', { replace: true })
}
</script>
