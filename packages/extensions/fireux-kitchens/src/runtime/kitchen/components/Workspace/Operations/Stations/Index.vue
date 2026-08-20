<template>
  <section class="workspace-surface">
    <!-- Tools: add operation-level actions here when a real tool emerges. -->
    <WorkspaceKitchenOperationsStationsRead />

    <UAlert
      v-if="readOnly"
      color="neutral"
      variant="soft"
      title="Read only"
      description="This kitchen can be inspected, but changes are disabled."
    />

    <WorkspaceOperationWritePanel
      v-if="canWrite"
      title="Create station"
      description="Add an operating station for this kitchen."
    >
      <WorkspaceKitchenOperationsStationsWrite />
    </WorkspaceOperationWritePanel>
  </section>
</template>

<script setup lang="ts">
import { useKitchenWorkspaceStations } from '../../../../composables/workspace/operations/Stations/useKitchenWorkspaceStations'

const { readOnly, canWrite } = useKitchenWorkspaceStations()
</script>
