<template>
  <section class="workspace-surface">
    <!-- Tools: add operation-level actions here when a real tool emerges. -->
    <WorkspaceKitchenSuppliersRead />

    <MoleculesDisclosurePanel
      v-if="canWrite"
      title="Supplier actions"
      description="Connect supplier workflows for this kitchen."
    >
      <div class="mt-4"><WorkspaceKitchenSuppliersWrite /></div>
    </MoleculesDisclosurePanel>
  </section>
</template>

<script setup lang="ts">
import { useKitchenWorkspaceSuppliers } from '../../../composables/workspace/suppliers/useKitchenWorkspaceSuppliers'

const { canWrite } = useKitchenWorkspaceSuppliers()
</script>
