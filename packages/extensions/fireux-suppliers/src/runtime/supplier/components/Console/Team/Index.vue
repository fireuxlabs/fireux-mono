<template>
  <section class="console-surface console-surface--compact">
    <ConsoleTeamPanel
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
      scope="console"
      object-origin="fetched"
      :objects="{ supplier }"
      :derived="debug"
    />
  </section>
</template>

<script setup lang="ts">
import { useSupplierConsoleTeam } from '../../../composables/console/team/useSupplierConsoleTeam'

const {
  supplier,
  supplierId,
  teamIds,
  operatorIds,
  accessIds,
  readOnly,
  canWrite,
  debug,
} = useSupplierConsoleTeam()
</script>
