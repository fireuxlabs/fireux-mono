<template>
  <section class="workspace-surface">
    <WorkspaceKitchenMiseRead />

    <UAlert
      v-if="readOnly"
      color="neutral"
      variant="soft"
      title="Read only"
      description="This kitchen can be inspected, but changes are disabled."
    />

    <WorkspaceOperationWritePanel
      v-if="canWrite"
      title="Prep status board"
      description="Move current prep tasks through their working states."
    >
      <WorkspaceKitchenMiseWrite />
    </WorkspaceOperationWritePanel>
  </section>
</template>

<script setup lang="ts">
import { useKitchenMiseWorkspace } from '../../../composables/workspace/Mise/useKitchenMiseWorkspace'

const { readOnly, canWrite } = useKitchenMiseWorkspace()
</script>
