<template>
  <section class="console-surface console-surface--compact">
    <ConsoleTeamPanel
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
      scope="console"
      object-origin="fetched"
      :objects="{ blank }"
      :derived="debug"
    />
  </section>
</template>

<script setup lang="ts">
import { useBlankConsoleTeam } from '../../../../composables/fireux/console/blank/team/useBlankConsoleTeam'

const {
  blank,
  blankId,
  teamIds,
  operatorIds,
  accessIds,
  readOnly,
  canWrite,
  debug,
} = useBlankConsoleTeam()
</script>
