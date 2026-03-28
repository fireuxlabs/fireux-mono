<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { useRuntimePortfolioSelection } from '../../../../composables/fireux/app/portfolio-runtime/state'
import { getReadOnlyPortfolioScenarioList } from '../../../../composables/fireux/app/portfolio-runtime/read-only-scenarios'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
})

const { setRuntimePortfolio } = useRuntimePortfolioSelection()
const defaultScenarioId = String(getReadOnlyPortfolioScenarioList()[0]?.id || '').trim()

if (!defaultScenarioId) {
  await navigateTo('/console/portfolio', { replace: true })
} else {
  setRuntimePortfolio({
    mode: 'read-only',
    portfolioId: defaultScenarioId,
  })
  await navigateTo('/console/portfolio/overview', { replace: true })
}
</script>
