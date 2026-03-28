<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { useRuntimeProjectSelection } from '../../../../composables/fireux/app/runtime-project/state'
import { getReadOnlyProjectScenarioList } from '../../../../composables/fireux/app/runtime-project/read-only-scenarios/index'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
})

const { setRuntimeProject } = useRuntimeProjectSelection()
const defaultScenarioId = String(getReadOnlyProjectScenarioList()[0]?.id || '').trim()

if (!defaultScenarioId) {
  await navigateTo('/console/projects', { replace: true })
} else {
  setRuntimeProject({
    mode: 'read-only',
    projectId: defaultScenarioId,
  })
  await navigateTo('/console/projects/overview', { replace: true })
}
</script>
