<template>
  <section class="console-surface space-y-4">
    <ConsolePortfolioIndexSelected
      :portfolio="selection.portfolio"
      :portfolio-id="selection.portfolioId"
      @clear="actions.clear"
    />

    <ConsolePortfolioIndexTargets
      v-if="sections.targets.show"
      :collection="sections.targets.collection"
      :pending="sections.targets.pending"
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
