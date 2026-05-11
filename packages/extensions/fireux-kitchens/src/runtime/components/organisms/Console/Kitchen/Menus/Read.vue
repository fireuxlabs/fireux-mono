<template>
  <div class="space-y-6">
    <OrganismsConsoleKitchenMenusPreview
      :collection="menus"
      :can-write="canWrite"
      :collection-path="collectionPath"
      :database-id="databaseId"
    />

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Kitchen menus"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleMenus } from '../../../../../composables/fireux/app/kitchen-console/useKitchenConsoleMenus'

const {
  menus,
  collectionPath,
  databaseId,
  canWrite,
  debug,
} = useKitchenConsoleMenus({ includeDishes: false })
const isDev = import.meta.dev
</script>
