<template>
  <section class="console-surface space-y-6">
    <OrganismsConsoleKitchenMiseRead :mise-tasks="miseTasks" />

    <OrganismsConsoleKitchenMiseWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleMise } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleMise'

const { miseTasks, canWrite } = useKitchenConsoleMise()
</script>
