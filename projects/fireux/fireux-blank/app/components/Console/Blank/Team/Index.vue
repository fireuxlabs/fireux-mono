<template>
  <section class="console-surface space-y-4">
    <ConsoleTeamPanel
      entity-label="Blank"
      :target-id="blankId"
      :team-ids="teamIds"
      :operator-ids="operatorIds"
      :access-ids="accessIds"
      :read-only="readOnly"
      :can-write="canWrite"
    />

    <DevFireuxDebugPanel
      title="Blank team"
      scope="console"
      :data="debug"
    />
  </section>
</template>

<script setup lang="ts">
import { useBlankConsoleTeam } from '../../../../composables/fireux/console/blank/team/useBlankConsoleTeam'

const { blankId, teamIds, operatorIds, accessIds, readOnly, canWrite, debug } =
  useBlankConsoleTeam()
</script>
