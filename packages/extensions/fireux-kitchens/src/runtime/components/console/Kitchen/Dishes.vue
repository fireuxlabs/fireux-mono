<template>
  <section class="console-surface space-y-6">
    <OrganismsConsoleKitchenDishesRead :dishes="dishes" :sections="sections" />

    <OrganismsConsoleKitchenDishesWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleDishes } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleDishes'

const { dishes, canWrite, sections } = useKitchenConsoleDishes()
</script>
