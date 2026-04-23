<template>
  <section class="console-surface space-y-4">
    <OrganismsConsoleKitchenMiseRead
      :mise-tasks="miseTasks"
      :pending="pending"
    />

    <OrganismsConsoleKitchenMiseWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleMise } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleMise'

const { miseTasks, pending, canWrite } = useKitchenConsoleMise()
</script>
