<template>
  <section class="console-surface space-y-4">
    <OrganismsConsoleKitchenMenusRead
      :menus="menus"
      :pending="pending"
    />

    <OrganismsConsoleKitchenMenusWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleMenus } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleMenus'

const { menus, pending, canWrite } = useKitchenConsoleMenus()
</script>
