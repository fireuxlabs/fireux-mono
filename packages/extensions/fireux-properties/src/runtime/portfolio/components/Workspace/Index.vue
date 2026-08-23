<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Portfolio target outcome contract. -->
<template>
  <section class="workspace-surface workspace-surface--compact">
    <WorkspacePortfolioIndexSelected
      :portfolio="portfolio"
      :portfolio-id="portfolioId"
      @clear="clearPortfolio"
    />

    <WorkspacePortfolioIndexTargets
      :collection="portfolios"
      :outcome="outcome"
      @select="selectPortfolio"
    />

    <DevDebugPanel
      title="Portfolio workspace debug"
      scope="workspace"
      object-origin="fetched"
      :objects="{
        selectedPortfolio: portfolio,
        portfolios,
      }"
      :derived="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { usePortfolioWorkspaceIndex } from '../../composables/workspace/index/usePortfolioWorkspaceIndex'

const {
  portfolio,
  portfolioId,
  portfolios,
  outcome,
  selectPortfolio,
  clearPortfolio,
  debug,
} = usePortfolioWorkspaceIndex()
</script>
