<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo, useRoute } from '#imports'
import { useRuntimeProjectSelection } from 'fireux-core/runtime/composables/fireux/app/runtime-project/state'
import {
  getReadOnlyProjectScenario,
  getReadOnlyProjectScenarioList,
} from 'fireux-core/runtime/composables/fireux/app/runtime-project/read-only-scenarios/index'

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
  await navigateTo('/console/projects/overview', { replace: true })
}
</script>
