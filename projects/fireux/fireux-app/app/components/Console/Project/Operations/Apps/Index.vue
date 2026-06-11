<template>
  <section class="console-surface space-y-4">
    <ConsoleProjectAppsRead />

    <ConsoleProjectAppsWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useProjectConsoleApps } from '../../../../../composables/fireux/console/project/operations/Apps/useProjectConsoleApps'

const { canWrite } = useProjectConsoleApps()
</script>
