<template>
  <section class="space-y-4">
    <ConsolePortfolioTargetsSelected
      :portfolio="selectedPortfolio"
      :portfolio-id="portfolioId"
      :mode="selectedMode"
      @clear="clearSelectedPortfolio"
    />

    <ConsolePortfolioTargetsLive
      :collection="portfolios.live"
      @select="actions.selectLive"
    />

    <ConsolePortfolioTargetsDemo
      :collection="portfolios.demo"
      @select="actions.selectDemo"
    />
    <ConsolePortfolioTargetsTest :init="false" />

    <DevJson
      title="Portfolio console debug"
      context="portfolio · /console/portfolio"
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
