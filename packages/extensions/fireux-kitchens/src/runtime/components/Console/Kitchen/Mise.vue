<template>
  <section class="console-surface space-y-6">
    <ConsoleKitchenMiseRead />

    <ConsoleKitchenMiseWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleMise } from '../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleMise'

const { canWrite } = useKitchenConsoleMise()
</script>
