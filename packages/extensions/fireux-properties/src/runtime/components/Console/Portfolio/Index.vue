<template>
  <section class="space-y-4">
    <ConsolePortfolioTargetsSelected
      :portfolio="selectedPortfolio"
      :portfolio-id="portfolioId"
      @clear="clearSelectedPortfolio"
    />

    <ConsolePortfolioTargetsLive
      :collection="portfolios.live"
      @select="actions.selectLive"
    />

    <ConsolePortfolioTargetsDemo />
    <ConsolePortfolioTargetsTest />

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
  portfolioId,
  debug,
  clearSelectedPortfolio,
} = usePortfolioConsoleIndex()
</script>
