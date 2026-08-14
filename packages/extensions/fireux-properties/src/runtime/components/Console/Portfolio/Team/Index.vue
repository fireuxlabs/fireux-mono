<template>
  <section class="console-surface console-surface--compact">
    <ConsoleTeamPanel
      entity-label="Portfolio"
      :target-id="portfolioId"
      :team-ids="teamIds"
      :operator-ids="operatorIds"
      :access-ids="accessIds"
      :read-only="readOnly"
      :can-write="canWrite"
    />
    <DevDebugPanel
      title="Portfolio team"
      scope="console"
      object-origin="fetched"
      :objects="{ portfolio }"
      :derived="debug"
    />
  </section>
</template>

<script setup lang="ts">
import { usePortfolioConsoleTeam } from '../../../../composables/fireux/console/portfolio/team/usePortfolioConsoleTeam'

const {
  portfolio,
  portfolioId,
  teamIds,
  operatorIds,
  accessIds,
  readOnly,
  canWrite,
  debug,
} = usePortfolioConsoleTeam()
</script>
