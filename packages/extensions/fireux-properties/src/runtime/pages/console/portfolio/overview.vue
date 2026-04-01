<template>
  <UDashboardPanel id="console-portfolio-home">
    <template #header>
      <LayoutsConsoleNavbar title="Portfolio Overview" />
    </template>

    <template #body>
      <section class="space-y-4">
        <UAlert
          v-if="activePortfolioPill"
          color="primary"
          variant="soft"
          :title="activePortfolioPill.title"
          :description="activePortfolioPill.subtitle || ''"
        />

        <UAlert
          v-else-if="showSelector"
          color="neutral"
          variant="soft"
          title="Select a demo portfolio"
        />

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          title="No demo portfolios"
        />

        <div v-if="showSelector" class="space-y-2">
          <PortfolioCardsPill
            v-for="item in scenarioPills"
            :key="item.id"
            v-bind="item"
            :link="false"
            :action="true"
            :show-badges="false"
            class="cursor-pointer"
            @action="selectScenario(item.id)"
          />
        </div>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'
import { useRuntimePortfolioConsole } from '../../../composables/fireux/app/portfolio-runtime/useRuntimePortfolioConsole'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-portfolio-overview',
    label: 'Overview',
    icon: 'i-lucide-layout-dashboard',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const {
  runtime,
  scenarios,
  scenarioPills,
  activePortfolioPill,
  showSelector,
  setActiveScenario,
} = useRuntimePortfolioConsole()

if (import.meta.client) {
  watchEffect(() => {
    if (runtime.id.value) return
    if (scenarios.value.length !== 1) return
    const scenarioId = String(scenarios.value[0]?.id || '').trim()
    if (!scenarioId) return
    setActiveScenario(scenarioId)
  })
}

const selectScenario = (portfolioId: string) => {
  setActiveScenario(portfolioId)
}
</script>
