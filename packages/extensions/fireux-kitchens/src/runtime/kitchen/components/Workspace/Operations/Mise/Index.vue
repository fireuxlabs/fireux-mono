<template>
  <section class="workspace-surface">
    <WorkspaceKitchenOperationsMiseRead />

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
      <WorkspaceKitchenOperationsMiseWrite />
    </WorkspaceOperationWritePanel>
  </section>
</template>

<script setup lang="ts">
import { provideKitchenMiseWorkspace } from '../../../../composables/workspace/operations/Mise/useKitchenMiseWorkspace'

const { readOnly, canWrite } = provideKitchenMiseWorkspace()
</script>
