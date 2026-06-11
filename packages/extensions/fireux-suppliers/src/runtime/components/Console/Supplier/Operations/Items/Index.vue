<template>
  <section class="console-surface space-y-6">
    <ConsoleSupplierOperationsItemsRead />

    <ConsoleSupplierOperationsItemsWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useSupplierConsoleItems } from '../../../../../composables/fireux/console/supplier/operations/Items/useSupplierConsoleItems'

const { canWrite } = useSupplierConsoleItems()
</script>
