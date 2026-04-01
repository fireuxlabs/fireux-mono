<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo, useRoute } from '#imports'
import { useRuntimeSupplierSelection } from '../../../../composables/fireux/app/supplier-console/state'
import {
  getReadOnlySupplierScenario,
  getReadOnlySupplierScenarioList,
} from '../../../../composables/fireux/app/supplier-console/read-only-scenarios'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
})

const route = useRoute()
const { setRuntimeSupplier } = useRuntimeSupplierSelection()
const requestedScenarioId = String(route.params.scenarioId || '').trim()
const fallbackScenarioId = String(getReadOnlySupplierScenarioList()[0]?.id || '').trim()
const resolvedScenarioId = getReadOnlySupplierScenario(requestedScenarioId)
  ? requestedScenarioId
  : fallbackScenarioId

if (!resolvedScenarioId) {
  await navigateTo('/console/supplier', { replace: true })
} else {
  setRuntimeSupplier({
    mode: 'read-only',
    supplierId: resolvedScenarioId,
  })
  await navigateTo('/console/supplier', { replace: true })
}
</script>
