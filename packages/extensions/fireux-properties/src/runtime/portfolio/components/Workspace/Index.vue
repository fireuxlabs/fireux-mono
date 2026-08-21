<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Portfolio target outcome contract. -->
<template>
  <section class="workspace-surface workspace-surface--compact">
    <WorkspacePortfolioIndexSelected
      :portfolio="selection.portfolio"
      :portfolio-id="selection.portfolioId"
      @clear="actions.clear"
    />

    <WorkspacePortfolioIndexTargets
      v-if="sections.targets.show"
      :collection="sections.targets.collection"
      :outcome="sections.targets.outcome"
      @select="actions.selectTarget"
    />

    <DevDebugPanel
      title="Portfolio workspace debug"
      scope="workspace"
      object-origin="fetched"
      :objects="{
        selectedPortfolio: selection.portfolio,
        portfolios: sections.targets.collection,
      }"
      :derived="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { usePortfolioWorkspaceIndex } from '../../composables/workspace/index/usePortfolioWorkspaceIndex'

const { selection, sections, actions, debug } = usePortfolioWorkspaceIndex()
</script>
