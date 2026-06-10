<template>
  <section class="console-surface space-y-6">
    <ConsoleKitchenOperationsDishesRead />

    <ConsoleKitchenOperationsDishesWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleDishes } from '../../../../../composables/fireux/console/kitchen/Operations/Dishes/useKitchenConsoleDishes'

const { canWrite } = useKitchenConsoleDishes({ resolveMenuSections: false })
</script>
