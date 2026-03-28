<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { resolveConsoleTestRuntimeId } from 'fireux-core/runtime/composables/fireux/app/ui/console-entry-routing'
import { useConsoleEntryState } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleEntryState'
import { useRuntimePortfolioSelection } from '../../../composables/fireux/app/portfolio-runtime/state'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
})

const { uid } = useConsoleEntryState()
const { setRuntimePortfolio } = useRuntimePortfolioSelection()

setRuntimePortfolio({
  mode: 'test',
  portfolioId: resolveConsoleTestRuntimeId({
    entityKey: 'portfolio',
    uid: uid.value,
  }),
})

await navigateTo('/console/portfolio/overview', { replace: true })
</script>
