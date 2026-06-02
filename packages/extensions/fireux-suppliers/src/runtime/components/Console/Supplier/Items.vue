<template>
  <section class="console-surface space-y-6">
    <ConsoleSupplierItemsRead />

    <ConsoleSupplierItemsWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useSupplierConsoleItems } from '../../../composables/fireux/console/supplier/operations/useSupplierConsoleItems'

const { canWrite } = useSupplierConsoleItems()
</script>
