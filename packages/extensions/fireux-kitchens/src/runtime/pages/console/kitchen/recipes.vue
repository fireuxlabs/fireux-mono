<template>
  <UDashboardPanel id="console-kitchen-recipes">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Recipes" />
    </template>

    <template #body>
      <section class="space-y-4">
        <UAlert
          v-if="!selectedKitchen"
          color="neutral"
          variant="soft"
          title="No kitchen selected"
          description="Select a kitchen on /console/kitchen before opening kitchen recipes."
          :actions="[
            {
              label: 'Go to kitchens',
              to: '/console/kitchen',
              icon: 'i-lucide-arrow-right',
            },
          ]"
        />

        <ConsoleKitchenRecipes v-else />
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
    key: 'console-kitchen-recipes',
    label: 'Recipes',
    icon: 'i-lucide-book-copy',
    position: 'top',
    requiresSelection: true,
    order: 4,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { selectedKitchen } = useKitchenConsole()
</script>
