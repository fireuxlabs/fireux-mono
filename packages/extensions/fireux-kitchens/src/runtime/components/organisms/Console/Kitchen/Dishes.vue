<template>
  <section class="console-surface space-y-6">
    <ConsoleKitchenDishesRead />

    <ConsoleKitchenDishesWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleDishes } from '../../../../composables/fireux/app/kitchen-console/useKitchenConsoleDishes'

const { canWrite } = useKitchenConsoleDishes({ resolveMenuSections: false })
</script>
