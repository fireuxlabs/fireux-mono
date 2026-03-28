<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { resolveConsoleTestRuntimeId } from 'fireux-core/runtime/composables/fireux/app/ui/console-entry-routing'
import { useConsoleEntryState } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleEntryState'
import { useRuntimeKitchenSelection } from '../../../composables/fireux/app/kitchen-runtime/state'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
})

const { uid } = useConsoleEntryState()
const { setRuntimeKitchen } = useRuntimeKitchenSelection()

setRuntimeKitchen({
  mode: 'test',
  kitchenId: resolveConsoleTestRuntimeId({
    entityKey: 'kitchen',
    uid: uid.value,
  }),
})

await navigateTo('/console/kitchen/overview', { replace: true })
</script>
