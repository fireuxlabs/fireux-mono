<template>
  <section class="console-surface space-y-6">
    <OrganismsConsoleKitchenDishesRead />

    <OrganismsConsoleKitchenDishesWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleDishes } from '../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleDishes'

const { canWrite } = useKitchenConsoleDishes({ resolveMenuSections: false })
</script>
