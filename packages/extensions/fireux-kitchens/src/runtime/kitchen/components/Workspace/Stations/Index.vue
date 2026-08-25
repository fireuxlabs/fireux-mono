<template>
  <section class="workspace-surface">
    <WorkspaceKitchenStationsRead />

    <UAlert
      v-if="readOnly"
      color="neutral"
      variant="soft"
      title="Read only"
      description="This kitchen can be inspected, but changes are disabled."
    />

  </section>
</template>

<script setup lang="ts">
import { useKitchenWorkspaceStations } from '../../../composables/workspace/Stations/useKitchenWorkspaceStations'

const { readOnly } = useKitchenWorkspaceStations()
</script>
