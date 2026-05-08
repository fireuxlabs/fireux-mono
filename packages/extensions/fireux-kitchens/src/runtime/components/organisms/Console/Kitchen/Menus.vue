<template>
  <section class="console-surface space-y-6">
    <OrganismsConsoleKitchenMenusRead v-if="selectedKitchen" />

    <OrganismsConsoleKitchenMenusWrite v-if="canWrite || !selectedKitchen" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleMenus } from '../../../../composables/fireux/app/kitchen-console/useKitchenConsoleMenus'

const { canWrite, selectedKitchen } = useKitchenConsoleMenus()
</script>
