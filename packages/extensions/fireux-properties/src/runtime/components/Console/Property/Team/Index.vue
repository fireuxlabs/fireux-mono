<template>
  <section class="console-surface space-y-4">
    <ConsoleTeamPanel
      entity-label="Property"
      :target-id="propertyId"
      :team-ids="teamIds"
      :operator-ids="operatorIds"
      :access-ids="accessIds"
      :read-only="readOnly"
      :can-write="canWrite"
    />

    <DevFireuxDebugPanel
      title="Property team"
      scope="console"
      :data="debug"
    />
  </section>
</template>

<script setup lang="ts">
import { usePropertyConsoleTeam } from '../../../../composables/fireux/console/property/team/usePropertyConsoleTeam'

const { propertyId, teamIds, operatorIds, accessIds, readOnly, canWrite, debug } =
  usePropertyConsoleTeam()
</script>
