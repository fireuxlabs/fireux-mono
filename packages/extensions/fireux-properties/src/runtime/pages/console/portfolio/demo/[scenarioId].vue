<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo, useRoute } from '#imports'
import { usePortfolioSelection } from '../../../../composables/fireux/app/portfolio-console/usePortfolioSelection'
import {
  getDemoPortfolioScenario,
  getDemoPortfolioScenarioList,
} from '../../../../composables/fireux/app/portfolio-console/demo-scenarios'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
})

const route = useRoute()
const { setRuntimePortfolio } = usePortfolioSelection()
const requestedScenarioId = String(route.params.scenarioId || '').trim()
const fallbackScenarioId = String(getDemoPortfolioScenarioList()[0]?.id || '').trim()
const resolvedScenarioId = getDemoPortfolioScenario(requestedScenarioId)
  ? requestedScenarioId
  : fallbackScenarioId

if (!resolvedScenarioId) {
  await navigateTo('/console/portfolio', { replace: true })
} else {
  setRuntimePortfolio({
    mode: 'demo',
    portfolioId: resolvedScenarioId,
  })
  await navigateTo('/console/portfolio', { replace: true })
}
</script>
