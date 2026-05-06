<template>
  <section class="console-surface space-y-6">
    <OrganismsConsoleKitchenMenusWrite v-if="canWrite || !selectedKitchen" />

    <OrganismsConsoleKitchenMenusRead v-else />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleMenus } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleMenus'

const { canWrite, selectedKitchen } = useKitchenConsoleMenus()
</script>
