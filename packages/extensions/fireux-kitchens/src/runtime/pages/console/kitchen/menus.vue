<template>
  <UDashboardPanel id="console-kitchen-menus">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Menus" />
    </template>

    <template #body>
      <section class="space-y-4">
        <UAlert
          v-if="!selectedKitchen"
          color="neutral"
          variant="soft"
          title="No kitchen selected"
          description="Select a kitchen on /console/kitchen before opening kitchen menus."
          :actions="[
            {
              label: 'Go to kitchens',
              to: '/console/kitchen',
              icon: 'i-lucide-arrow-right',
            },
          ]"
        />

        <ConsoleKitchenMenus v-else />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useKitchenConsole } from '../../../composables/fireux/app/kitchen-console/useKitchenConsole'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-menus',
    label: 'Menus',
    icon: 'i-lucide-book-open',
    position: 'top',
    requiresSelection: true,
    order: 1,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { selectedKitchen } = useKitchenConsole()
</script>
