<template>
  <UDashboardPanel id="console-kitchen-preview">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Preview" />
    </template>

    <template #body>
      <section class="space-y-4">
        <UAlert
          color="neutral"
          variant="soft"
          title="Preview only"
          :description="previewDescription"
        />

        <KitchenMenuSurfaceKiosk
          v-if="surface === 'kiosk'"
          :surface="menuSurface"
        />
        <OrganismsMenuQR
          v-else
          :menu="menuSurface"
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import KitchenMenuSurfaceKiosk from '../../../components/organisms/Menu/Public/KioskMenuSurface.vue'
import MenuQR from '../../../components/organisms/Menu/QR.vue'
import { useKitchenConsoleMenuSurface } from '../../../composables/fireux/app/useKitchenConsoleMenuSurface'
import { useKitchenConsole } from '../../../composables/fireux/app/kitchen-console/useKitchenConsole'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-preview',
    label: 'Preview',
    icon: 'i-lucide-smartphone',
    position: 'top',
    requiresSelection: true,
    order: 2,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { selectedMode } = useKitchenConsole()
const menuSurface = useKitchenConsoleMenuSurface()
const surface = computed(() => menuSurface.surface.value)
const previewDescription = computed(() =>
  selectedMode.value === 'demo'
    ? 'Demo kitchens render here as console previews. The basket is local to preview and checkout is disabled.'
    : 'Selected kitchen menus render here as console previews. The basket is local to preview and checkout is disabled.'
)
</script>
