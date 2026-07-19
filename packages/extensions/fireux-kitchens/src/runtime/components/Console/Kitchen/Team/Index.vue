<template>
  <section class="console-surface">
    <ConsoleTeamPanel
      entity-label="Kitchen"
      :target-id="kitchenId"
      :team-ids="teamIds"
      :operator-ids="operatorIds"
      :access-ids="accessIds"
      :read-only="readOnly"
      :can-write="canWrite"
    />

    <ConsoleKitchenTeamRead />

    <UAlert
      v-if="readOnly"
      color="neutral"
      variant="soft"
      title="Read only"
      description="This kitchen can be inspected, but changes are disabled."
    />

    <ConsoleKitchenTeamWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleTeam } from '../../../../composables/fireux/console/kitchen/team/useKitchenConsoleTeam'

const {
  kitchenId,
  teamIds,
  operatorIds,
  accessIds,
  readOnly,
  canWrite,
} = useKitchenConsoleTeam()
</script>
