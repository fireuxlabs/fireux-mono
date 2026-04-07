<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo, useRoute } from '#imports'
import { useSupplierSelection } from '../../../../composables/fireux/app/supplier-console/useSupplierSelection'
import {
  getDemoSupplierScenario,
  getDemoSupplierScenarioList,
} from '../../../../composables/fireux/app/supplier-console/demo-scenarios'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
})

const route = useRoute()
const { setRuntimeSupplier } = useSupplierSelection()
const requestedScenarioId = String(route.params.scenarioId || '').trim()
const fallbackScenarioId = String(getDemoSupplierScenarioList()[0]?.id || '').trim()
const resolvedScenarioId = getDemoSupplierScenario(requestedScenarioId)
  ? requestedScenarioId
  : fallbackScenarioId

if (!resolvedScenarioId) {
  await navigateTo('/console/supplier', { replace: true })
} else {
  setRuntimeSupplier({
    mode: 'demo',
    supplierId: resolvedScenarioId,
  })
  await navigateTo('/console/supplier', { replace: true })
}
</script>
