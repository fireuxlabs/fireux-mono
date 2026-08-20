<template>
  <section class="workspace-surface workspace-surface--compact">
    <WorkspaceTeamPanel
      entity-label="Blank"
      :target-id="blankId"
      :team-ids="teamIds"
      :operator-ids="operatorIds"
      :access-ids="accessIds"
      :read-only="readOnly"
      :can-write="canWrite"
    />
    <DevDebugPanel
      title="Blank team"
      scope="workspace"
      object-origin="fetched"
      :objects="{ blank }"
      :derived="debug"
    />
  </section>
</template>

<script setup lang="ts">
import { useBlankWorkspaceTeam } from '../../../../composables/fireux/workspace/blank/team/useBlankWorkspaceTeam'

const {
  blank,
  blankId,
  teamIds,
  operatorIds,
  accessIds,
  readOnly,
  canWrite,
  debug,
} = useBlankWorkspaceTeam()
</script>
