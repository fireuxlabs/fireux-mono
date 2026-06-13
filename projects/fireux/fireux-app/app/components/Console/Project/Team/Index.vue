<template>
  <section class="console-surface space-y-4">
    <ConsoleTeamPanel
      entity-label="Project"
      :target-id="projectId"
      :team-ids="teamIds"
      :operator-ids="operatorIds"
      :access-ids="accessIds"
      :read-only="readOnly"
      :can-write="canWrite"
    />

    <DevFireuxDebugPanel
      title="Project team"
      scope="console"
      :data="debug"
    />
  </section>
</template>

<script setup lang="ts">
import { useProjectConsoleTeam } from '../../../../composables/fireux/console/project/team/useProjectConsoleTeam'

const { projectId, teamIds, operatorIds, accessIds, readOnly, canWrite, debug } =
  useProjectConsoleTeam()
</script>
