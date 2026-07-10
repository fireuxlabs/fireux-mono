<template>
  <section class="console-surface space-y-6">
    <ConsoleKitchenOperationsTablesRead />

    <UAlert
      v-if="readOnly"
      color="neutral"
      variant="soft"
      title="Read only"
      description="This kitchen can be inspected, but table configuration is disabled."
    />

    <ConsoleOperationWritePanel
      v-if="canWrite"
      title="Table setup"
      description="Configure the numbered tables used by table service."
    >
      <ConsoleKitchenOperationsTablesWrite />
    </ConsoleOperationWritePanel>
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleTables } from '../../../../../composables/fireux/console/kitchen/operations/Tables/useKitchenConsoleTables'

const { readOnly, canWrite } = useKitchenConsoleTables()
</script>
