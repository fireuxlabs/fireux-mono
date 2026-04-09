<template>
  <UDashboardPanel id="console-kitchen-overview">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Overview" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UAlert
          v-if="!kitchenState.id"
          color="neutral"
          variant="soft"
          title="No kitchen selected"
          description="Select a kitchen on /console/kitchen before opening the kitchen overview."
          :actions="[
            {
              label: 'Go to kitchens',
              to: '/console/kitchen',
              icon: 'i-lucide-arrow-right',
            },
          ]"
        />

        <template v-else>
          <KitchenCardsPill
            v-if="kitchen"
            v-bind="kitchen"
            :link="false"
            :show-badges="false"
          />

          <ConsoleKitchenOverview />
        </template>
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
    key: 'console-kitchen-overview',
    label: 'Overview',
    icon: 'i-lucide-house',
    position: 'top',
    requiresSelection: true,
    order: 0,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { kitchenState, kitchen } = useKitchenConsole({
  publishHeader: true,
})
</script>
