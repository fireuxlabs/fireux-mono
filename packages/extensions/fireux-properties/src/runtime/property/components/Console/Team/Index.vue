<template>
  <section class="console-surface console-surface--compact">
    <ConsoleTeamPanel
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
      scope="console"
      object-origin="fetched"
      :objects="{ property }"
      :derived="debug"
    />
  </section>
</template>

<script setup lang="ts">
import { usePropertyConsoleTeam } from '../../../composables/console/team/usePropertyConsoleTeam'

const {
  property,
  propertyId,
  teamIds,
  operatorIds,
  accessIds,
  readOnly,
  canWrite,
  debug,
} = usePropertyConsoleTeam()
</script>
