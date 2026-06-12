<template>
  <section class="console-surface space-y-4">
    <ConsoleTeamPanel
      entity-label="Portfolio"
      :target-id="portfolioId"
      :team-ids="teamIds"
      :operator-ids="operatorIds"
      :access-ids="accessIds"
    />

    <DevFireuxDebugPanel
      title="Portfolio team"
      scope="console"
      :data="debug"
    />
  </section>
</template>

<script setup lang="ts">
import { usePortfolioConsoleTeam } from '../../../../composables/fireux/console/portfolio/team/usePortfolioConsoleTeam'

const { portfolioId, teamIds, operatorIds, accessIds, debug } =
  usePortfolioConsoleTeam()
</script>
