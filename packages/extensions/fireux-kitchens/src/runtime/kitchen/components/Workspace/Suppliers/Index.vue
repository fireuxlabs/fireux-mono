<template>
  <section class="workspace-surface">
    <!-- Tools: add operation-level actions here when a real tool emerges. -->
    <WorkspaceKitchenSuppliersRead />

    <WorkspaceOperationWritePanel
      v-if="canWrite"
      title="Supplier actions"
      description="Connect supplier workflows for this kitchen."
    >
      <WorkspaceKitchenSuppliersWrite />
    </WorkspaceOperationWritePanel>
  </section>
</template>

<script setup lang="ts">
import { useKitchenWorkspaceSuppliers } from '../../../composables/workspace/Suppliers/useKitchenWorkspaceSuppliers'

const { canWrite } = useKitchenWorkspaceSuppliers()
</script>
