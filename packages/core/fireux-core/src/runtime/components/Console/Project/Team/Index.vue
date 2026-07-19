<template>
  <section class="console-surface console-surface--compact">
    <ConsoleTeamPanel
      entity-label="Project"
      :target-id="projectId"
      :team-ids="[]"
      :operator-ids="operatorIds"
      :access-ids="accessIds"
      :read-only="readOnly"
      :can-write="canWrite"
    />

    <DevFireuxDebugPanel
      title="Project access"
      scope="console"
      :data="debug"
    />
  </section>
</template>

<script setup lang="ts">
import { useProjectConsoleTeam } from '../../../../composables/fireux/console/project/team/useProjectConsoleTeam'

const { projectId, operatorIds, accessIds, readOnly, canWrite, debug } =
  useProjectConsoleTeam()
</script>
