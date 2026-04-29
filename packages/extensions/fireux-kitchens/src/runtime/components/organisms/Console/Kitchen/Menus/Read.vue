<template>
  <div class="space-y-6">
    <OrganismsMenuCollectionManager
      :collection="menus"
      title="Menus"
      description="Browse menus for the selected kitchen."
      :link="false"
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

const { menus, debug } = useKitchenConsoleMenus()
const isDev = import.meta.dev
</script>
