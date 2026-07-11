<template>
  <ConsoleKitchenOperationsTablesRead />

  <UAlert
    v-if="readOnly"
    color="neutral"
    variant="soft"
    title="Read only"
    description="This kitchen can be inspected, but table configuration is disabled."
  />
</template>

<script setup lang="ts">
import { useKitchenConsoleTables } from '../../../../../composables/fireux/console/kitchen/operations/Tables/useKitchenConsoleTables'

const { readOnly } = useKitchenConsoleTables()
</script>
