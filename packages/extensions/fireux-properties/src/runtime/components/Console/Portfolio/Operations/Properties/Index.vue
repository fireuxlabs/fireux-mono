<template>
  <section class="console-surface space-y-4">
    <!-- Tools: add operation-level actions here when a real tool emerges. -->
    <ConsolePortfolioOperationsPropertiesRead />

    <ConsoleOperationWritePanel
      v-if="canWrite"
      title="Property actions"
      description="Create or update portfolio properties."
    >
      <ConsolePortfolioOperationsPropertiesWrite />
    </ConsoleOperationWritePanel>
  </section>
</template>

<script setup lang="ts">
import { usePortfolioConsoleProperties } from '../../../../../composables/fireux/console/portfolio/operations/Properties/usePortfolioConsoleProperties'

const { canWrite } = usePortfolioConsoleProperties()
</script>
