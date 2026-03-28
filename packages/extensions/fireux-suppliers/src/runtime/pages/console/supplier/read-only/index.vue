<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { useRuntimeSupplierSelection } from '../../../../composables/fireux/app/supplier-console/state'
import { getReadOnlySupplierScenarioList } from '../../../../composables/fireux/app/supplier-console/read-only-scenarios'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
})

const { setRuntimeSupplier } = useRuntimeSupplierSelection()
const defaultScenarioId = String(getReadOnlySupplierScenarioList()[0]?.id || '').trim()

if (!defaultScenarioId) {
  await navigateTo('/console/supplier', { replace: true })
} else {
  setRuntimeSupplier({
    mode: 'read-only',
    supplierId: defaultScenarioId,
  })
  await navigateTo('/console/supplier/overview', { replace: true })
}
</script>
