<template>
  <div class="space-y-6">
    <UButton
      to="/console/kitchen/menus"
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      size="sm"
    >
      Back to menus
    </UButton>

    <MenuProfile
      v-if="menu"
      :menu="menu"
      :dishes="dishes"
    />

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      :title="pending ? 'Loading menu' : 'Menu not found'"
      :description="
        pending
          ? 'Fetching the selected kitchen menu.'
          : `No menu was found for ${menuId || 'this route'}.`
      "
    />

    <details
      v-if="canWrite && menu"
      class="rounded-lg border border-default p-4"
    >
      <summary class="cursor-pointer select-none text-sm font-semibold text-highlighted">
        Edit
      </summary>

      <div class="mt-4">
        <OrganismsConsoleKitchenMenusWrite
          :menu-id="menuId"
          detail-mode
        />
      </div>
    </details>

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Kitchen menu detail"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleMenu } from '../../../../../composables/fireux/app/kitchen-console/useKitchenConsoleMenu'
import MenuProfile from '../../../Menu/Cards/Profile.vue'

const { menu, menuId, dishes, pending, canWrite, debug } = useKitchenConsoleMenu()
const isDev = import.meta.dev
</script>
