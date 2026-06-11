<template>
  <section class="space-y-4">
    <ConsolePortfolioIndexSelected
      :portfolio="selectedPortfolio"
      :portfolio-id="portfolioId"
      :mode="selectedMode"
      @clear="clearSelectedPortfolio"
    />

    <ConsolePortfolioIndexLive
      :collection="portfolios.live"
      @select="actions.selectLive"
    />

    <ConsolePortfolioIndexDemo
      :collection="portfolios.demo"
      @select="actions.selectDemo"
    />
    <ConsolePortfolioIndexTest :init="false" />

    <DevFireuxDebugPanel
      title="Portfolio console debug"
      scope="console"
      :data="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { usePortfolioConsoleIndex } from '../../../composables/fireux/console/portfolio/usePortfolioConsoleIndex'

const {
  portfolios,
  actions,
  selectedPortfolio,
  selectedMode,
  portfolioId,
  debug,
  clearSelectedPortfolio,
} = usePortfolioConsoleIndex()
</script>
