<template>
  <section class="console-surface">
    <!-- Tools: add operation-level actions here when a real tool emerges. -->
    <ConsoleSupplierOperationsItemsRead />

    <ConsoleOperationWritePanel
      v-if="canWrite"
      title="Item actions"
      description="Create or update supplier items."
    >
      <ConsoleSupplierOperationsItemsWrite />
    </ConsoleOperationWritePanel>
  </section>
</template>

<script setup lang="ts">
import { useSupplierConsoleItems } from '../../../../../composables/fireux/console/supplier/operations/Items/useSupplierConsoleItems'

const { canWrite } = useSupplierConsoleItems()
</script>
