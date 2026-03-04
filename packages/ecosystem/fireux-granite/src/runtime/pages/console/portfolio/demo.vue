<template>
  <UDashboardPanel id="console-portfolio-demo">
    <template #header>
      <LayoutsConsoleNavbar title="Portfolio Demo" />
    </template>

    <template #body>
      <UPage>
        <UPageBody class="pagebody">
          <UPageCard
            title="Loading read-only demo"
            description="Selecting a demo portfolio runtime scope."
            variant="subtle"
          />
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { navigateTo, onMounted } from '#imports'
import { useRuntimePortfolioSelection } from 'fireux-properties/runtime/composables/fireux/app/portfolio-runtime/state'

definePageMeta({
  layout: 'granite-console',
  requiresAuth: true,
})

const { setRuntimePortfolio } = useRuntimePortfolioSelection()
const READ_ONLY_PORTFOLIO_SCENARIO_IDS = [
  'granite-demo-core',
  'lakeside-stability',
  'cityline-momentum',
] as const

onMounted(async () => {
  const randomReadOnlyId =
    READ_ONLY_PORTFOLIO_SCENARIO_IDS[
      Math.floor(Math.random() * READ_ONLY_PORTFOLIO_SCENARIO_IDS.length)
    ] || ''

  if (randomReadOnlyId) {
    setRuntimePortfolio({ portfolioId: randomReadOnlyId, mode: 'read-only' })
  }

  await navigateTo('/console/portfolio', { replace: true })
})
</script>
