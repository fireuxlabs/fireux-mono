<template>
  <section class="workspace-surface workspace-surface--compact">
    <WorkspaceTeamPanel
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
      scope="workspace"
      object-origin="fetched"
      :objects="{ portfolio }"
      :derived="debug"
    />
  </section>
</template>

<script setup lang="ts">
import { usePortfolioWorkspaceTeam } from '../../../composables/workspace/team/usePortfolioWorkspaceTeam'

const {
  portfolio,
  portfolioId,
  teamIds,
  operatorIds,
  accessIds,
  readOnly,
  canWrite,
  debug,
} = usePortfolioWorkspaceTeam()
</script>
