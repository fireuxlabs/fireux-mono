<template>
  <section class="console-surface space-y-6">
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

const { readOnly, canWrite } = useKitchenConsoleTeam()
</script>
