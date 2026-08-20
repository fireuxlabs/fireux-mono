<template>
  <section class="workspace-surface workspace-surface--compact">
    <WorkspaceTeamPanel
      entity-label="Supplier"
      :target-id="supplierId"
      :team-ids="teamIds"
      :operator-ids="operatorIds"
      :access-ids="accessIds"
      :read-only="readOnly"
      :can-write="canWrite"
    />
    <DevDebugPanel
      title="Supplier team"
      scope="workspace"
      object-origin="fetched"
      :objects="{ supplier }"
      :derived="debug"
    />
  </section>
</template>

<script setup lang="ts">
import { useSupplierWorkspaceTeam } from '../../../composables/workspace/team/useSupplierWorkspaceTeam'

const {
  supplier,
  supplierId,
  teamIds,
  operatorIds,
  accessIds,
  readOnly,
  canWrite,
  debug,
} = useSupplierWorkspaceTeam()
</script>
