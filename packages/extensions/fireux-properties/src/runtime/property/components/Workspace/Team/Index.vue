<template>
  <section class="workspace-surface workspace-surface--compact">
    <WorkspaceTeamPanel
      entity-label="Property"
      :target-id="propertyId"
      :team-ids="teamIds"
      :operator-ids="operatorIds"
      :access-ids="accessIds"
      :read-only="readOnly"
      :can-write="canWrite"
    />
    <DevDebugPanel
      title="Property team"
      scope="workspace"
      object-origin="fetched"
      :objects="{ property }"
      :derived="debug"
    />
  </section>
</template>

<script setup lang="ts">
import { usePropertyWorkspaceTeam } from '../../../composables/workspace/team/usePropertyWorkspaceTeam'

const {
  property,
  propertyId,
  teamIds,
  operatorIds,
  accessIds,
  readOnly,
  canWrite,
  debug,
} = usePropertyWorkspaceTeam()
</script>
