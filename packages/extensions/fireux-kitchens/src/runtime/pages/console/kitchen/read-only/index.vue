<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { useRuntimeKitchenSelection } from '../../../../composables/fireux/app/kitchen-runtime/state'
import { getReadOnlyKitchenScenarioList } from '../../../../composables/fireux/app/kitchen-runtime/read-only-scenarios'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
})

const { setRuntimeKitchen } = useRuntimeKitchenSelection()
const defaultScenarioId = String(getReadOnlyKitchenScenarioList()[0]?.id || '').trim()

if (!defaultScenarioId) {
  await navigateTo('/console/kitchen', { replace: true })
} else {
  setRuntimeKitchen({
    mode: 'read-only',
    kitchenId: defaultScenarioId,
  })
  await navigateTo('/console/kitchen/overview', { replace: true })
}
</script>
