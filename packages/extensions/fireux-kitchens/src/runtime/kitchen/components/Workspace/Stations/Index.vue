<template>
  <section class="workspace-surface">
    <UAlert
      v-if="defaultStationError"
      color="error"
      :title="defaultStationError"
    />
    <MoleculesCopyError
      v-if="defaultStationError"
      :message="defaultStationError"
    />
    <WorkspaceKitchenStationsCollection />

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
import { useKitchenWorkspaceStations } from '../../../composables/workspace/stations/useKitchenWorkspaceStations'

const { readOnly, defaultStationError } = useKitchenWorkspaceStations()
</script>
