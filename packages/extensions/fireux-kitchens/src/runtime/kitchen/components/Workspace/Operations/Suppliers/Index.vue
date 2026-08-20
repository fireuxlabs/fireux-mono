<template>
  <section class="workspace-surface">
    <!-- Tools: add operation-level actions here when a real tool emerges. -->
    <WorkspaceKitchenOperationsSuppliersRead />

    <WorkspaceOperationWritePanel
      v-if="canWrite"
      title="Supplier actions"
      description="Connect supplier workflows for this kitchen."
    >
      <WorkspaceKitchenOperationsSuppliersWrite />
    </WorkspaceOperationWritePanel>
  </section>
</template>

<script setup lang="ts">
import { useKitchenWorkspaceSuppliers } from '../../../../composables/workspace/operations/Suppliers/useKitchenWorkspaceSuppliers'

const { canWrite } = useKitchenWorkspaceSuppliers()
</script>
