<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo, useRoute } from '#imports'
import { useRuntimePortfolioSelection } from '../../../../composables/fireux/app/portfolio-runtime/state'
import {
  getReadOnlyPortfolioScenario,
  getReadOnlyPortfolioScenarioList,
} from '../../../../composables/fireux/app/portfolio-runtime/read-only-scenarios'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
})

const route = useRoute()
const { setRuntimePortfolio } = useRuntimePortfolioSelection()
const requestedScenarioId = String(route.params.scenarioId || '').trim()
const fallbackScenarioId = String(getReadOnlyPortfolioScenarioList()[0]?.id || '').trim()
const resolvedScenarioId = getReadOnlyPortfolioScenario(requestedScenarioId)
  ? requestedScenarioId
  : fallbackScenarioId

if (!resolvedScenarioId) {
  await navigateTo('/console/portfolio', { replace: true })
} else {
  setRuntimePortfolio({
    mode: 'read-only',
    portfolioId: resolvedScenarioId,
  })
  await navigateTo('/console/portfolio/overview', { replace: true })
}
</script>
