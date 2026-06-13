<template>
  <section class="console-surface space-y-4">
    <ConsoleTeamPanel
      entity-label="Supplier"
      :target-id="supplierId"
      :team-ids="teamIds"
      :operator-ids="operatorIds"
      :access-ids="accessIds"
      :read-only="readOnly"
      :can-write="canWrite"
    />

    <DevFireuxDebugPanel
      title="Supplier team"
      scope="console"
      :data="debug"
    />
  </section>
</template>

<script setup lang="ts">
import { useSupplierConsoleTeam } from '../../../../composables/fireux/console/supplier/team/useSupplierConsoleTeam'

const { supplierId, teamIds, operatorIds, accessIds, readOnly, canWrite, debug } =
  useSupplierConsoleTeam()
</script>
