<template>
  <section class="console-surface space-y-6">
    <OrganismsConsoleKitchenMenusRead />

    <OrganismsConsoleKitchenMenusWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleMenus } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleMenus'

const { canWrite } = useKitchenConsoleMenus()
</script>
