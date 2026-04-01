<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { useRuntimePortfolioSelection } from '../../../../composables/fireux/app/portfolio-runtime/state'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
})

const { setRuntimePortfolio } = useRuntimePortfolioSelection()
setRuntimePortfolio({
  mode: 'read-only',
  portfolioId: '',
})
await navigateTo('/console/portfolio', { replace: true })
</script>
