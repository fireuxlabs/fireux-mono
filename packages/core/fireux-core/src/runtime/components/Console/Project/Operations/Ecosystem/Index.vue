<template>
  <section class="console-surface console-surface--compact">
    <!-- Tools: add operation-level actions here when a real tool emerges. -->
    <ConsoleProjectOperationsEcosystemRead />

    <ConsoleOperationWritePanel
      v-if="canWrite"
      title="Ecosystem actions"
      description="Create or update the project ecosystem link."
    >
      <ConsoleProjectOperationsEcosystemWrite />
    </ConsoleOperationWritePanel>
  </section>
</template>

<script setup lang="ts">
import { useProjectConsoleEcosystem } from '../../../../../composables/fireux/console/project/operations/Ecosystem/useProjectConsoleEcosystem'

const { canWrite } = useProjectConsoleEcosystem()
</script>
