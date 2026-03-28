<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { resolveConsoleTestRuntimeId } from 'fireux-core/runtime/composables/fireux/app/ui/console-entry-routing'
import { useConsoleEntryState } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleEntryState'
import { useRuntimeProjectSelection } from 'fireux-core/runtime/composables/fireux/app/runtime-project/state'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
})

const { uid } = useConsoleEntryState()
const { setRuntimeProject } = useRuntimeProjectSelection()

setRuntimeProject({
  mode: 'test',
  projectId: resolveConsoleTestRuntimeId({
    entityKey: 'project',
    uid: uid.value,
  }),
})

await navigateTo('/console/projects/overview', { replace: true })
</script>
