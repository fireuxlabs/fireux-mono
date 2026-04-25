<template>
  <section class="console-surface space-y-4">
    <OrganismsConsoleKitchenDishesRead
      :dishes="dishes"
      :pending="pending"
      :sections="sections"
    />

    <OrganismsConsoleKitchenDishesWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleDishes } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleDishes'

const { dishes, pending, canWrite, sections } = useKitchenConsoleDishes()
</script>
