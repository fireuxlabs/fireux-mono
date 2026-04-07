<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo, useRoute } from '#imports'
import { useKitchenSelection } from '../../../../composables/fireux/app/kitchen-console/useKitchenSelection'
import {
  getDemoKitchenScenario,
  getDemoKitchenScenarioList,
} from '../../../../composables/fireux/app/kitchen-console/demo-scenarios'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
})

const route = useRoute()
const { setRuntimeKitchen } = useKitchenSelection()
const requestedScenarioId = String(route.params.scenarioId || '').trim()
const fallbackScenarioId = String(getDemoKitchenScenarioList()[0]?.id || '').trim()
const resolvedScenarioId = getDemoKitchenScenario(requestedScenarioId)
  ? requestedScenarioId
  : fallbackScenarioId

if (!resolvedScenarioId) {
  await navigateTo('/console/kitchen', { replace: true })
} else {
  setRuntimeKitchen({
    mode: 'demo',
    kitchenId: resolvedScenarioId,
  })
  await navigateTo('/console/kitchen', { replace: true })
}
</script>
