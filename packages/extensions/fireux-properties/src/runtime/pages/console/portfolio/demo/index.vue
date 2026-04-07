<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { usePortfolioSelection } from '../../../../composables/fireux/app/portfolio-console/usePortfolioSelection'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
})

const { setRuntimePortfolio } = usePortfolioSelection()
setRuntimePortfolio({
  mode: 'demo',
  portfolioId: '',
})
await navigateTo('/console/portfolio', { replace: true })
</script>
