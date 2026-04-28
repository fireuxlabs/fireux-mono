<template>
  <section class="console-surface space-y-6">
    <OrganismsConsoleKitchenMenusRead :menus="menus" />

    <OrganismsConsoleKitchenMenusWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleMenus } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleMenus'

const { menus, canWrite } = useKitchenConsoleMenus()
</script>
