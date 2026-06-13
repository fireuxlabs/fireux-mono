<template>
  <section class="console-surface space-y-4">
    <ConsoleTeamPanel
      entity-label="Portfolio"
      :target-id="portfolioId"
      :team-ids="teamIds"
      :operator-ids="operatorIds"
      :access-ids="accessIds"
      :read-only="readOnly"
      :can-write="canWrite"
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

const { portfolioId, teamIds, operatorIds, accessIds, readOnly, canWrite, debug } =
  usePortfolioConsoleTeam()
</script>
