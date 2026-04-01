<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo, useRoute } from '#imports'
import { useRuntimeKitchenSelection } from '../../../../composables/fireux/app/kitchen-runtime/state'
import {
  getReadOnlyKitchenScenario,
  getReadOnlyKitchenScenarioList,
} from '../../../../composables/fireux/app/kitchen-runtime/read-only-scenarios'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
})

const route = useRoute()
const { setRuntimeKitchen } = useRuntimeKitchenSelection()
const requestedScenarioId = String(route.params.scenarioId || '').trim()
const fallbackScenarioId = String(getReadOnlyKitchenScenarioList()[0]?.id || '').trim()
const resolvedScenarioId = getReadOnlyKitchenScenario(requestedScenarioId)
  ? requestedScenarioId
  : fallbackScenarioId

if (!resolvedScenarioId) {
  await navigateTo('/console/kitchen', { replace: true })
} else {
  setRuntimeKitchen({
    mode: 'read-only',
    kitchenId: resolvedScenarioId,
  })
  await navigateTo('/console/kitchen', { replace: true })
}
</script>
