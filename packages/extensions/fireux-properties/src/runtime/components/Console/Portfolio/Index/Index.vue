<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Portfolio target outcome contract. -->
<template>
  <section class="console-surface console-surface--compact">
    <ConsolePortfolioIndexSelected
      :portfolio="selection.portfolio"
      :portfolio-id="selection.portfolioId"
      @clear="actions.clear"
    />

    <ConsolePortfolioIndexTargets
      v-if="sections.targets.show"
      :collection="sections.targets.collection"
      :outcome="sections.targets.outcome"
      @select="actions.selectTarget"
    />

    <DevFireuxDebugPanel
      title="Portfolio console debug"
      scope="console"
      :data="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { usePortfolioConsoleIndex } from '../../../../composables/fireux/console/portfolio/index/usePortfolioConsoleIndex'

const {
  selection,
  sections,
  actions,
  debug,
} = usePortfolioConsoleIndex()
</script>
