<template>
  <section class="console-surface space-y-6">
    <ConsoleKitchenOperationsSuppliersRead />

    <ConsoleKitchenOperationsSuppliersWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleSuppliers } from '../../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleSuppliers'

const { canWrite } = useKitchenConsoleSuppliers()
</script>
