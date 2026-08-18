<template>
  <section class="console-surface">
    <!-- Tools: add operation-level actions here when a real tool emerges. -->
    <ConsoleKitchenOperationsSuppliersRead />

    <ConsoleOperationWritePanel
      v-if="canWrite"
      title="Supplier actions"
      description="Connect supplier workflows for this kitchen."
    >
      <ConsoleKitchenOperationsSuppliersWrite />
    </ConsoleOperationWritePanel>
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleSuppliers } from '../../../../composables/console/operations/Suppliers/useKitchenConsoleSuppliers'

const { canWrite } = useKitchenConsoleSuppliers()
</script>
