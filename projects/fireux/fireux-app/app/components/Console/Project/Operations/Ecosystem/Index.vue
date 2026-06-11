<template>
  <section class="console-surface space-y-4">
    <ConsoleProjectEcosystemRead />

    <ConsoleProjectEcosystemWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useProjectConsoleEcosystem } from '../../../../../composables/fireux/console/project/operations/Ecosystem/useProjectConsoleEcosystem'

const { canWrite } = useProjectConsoleEcosystem()
</script>
