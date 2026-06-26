<template>
  <section class="console-surface space-y-4">
    <!-- Tools: add operation-level actions here when a real tool emerges. -->
    <ConsoleProjectOperationsAppsRead />

    <ConsoleOperationWritePanel
      v-if="canWrite"
      title="App actions"
      description="Create or update apps linked to this project."
    >
      <ConsoleProjectOperationsAppsWrite />
    </ConsoleOperationWritePanel>
  </section>
</template>

<script setup lang="ts">
import { useProjectConsoleApps } from '../../../../../composables/fireux/console/project/operations/Apps/useProjectConsoleApps'

const { canWrite } = useProjectConsoleApps()
</script>
