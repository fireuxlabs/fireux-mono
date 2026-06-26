<template>
  <section class="console-surface space-y-6">
    <!-- Tools: add operation-level actions here when a real tool emerges. -->
    <ConsoleSupplierOperationsCatalogueRead />

    <ConsoleOperationWritePanel
      v-if="canWrite"
      title="Catalogue actions"
      description="Create or update supplier catalogue items."
    >
      <ConsoleSupplierOperationsCatalogueWrite />
    </ConsoleOperationWritePanel>
  </section>
</template>

<script setup lang="ts">
import { useSupplierConsoleCatalogue } from '../../../../../composables/fireux/console/supplier/operations/Catalogue/useSupplierConsoleCatalogue'

const { canWrite } = useSupplierConsoleCatalogue()
</script>
