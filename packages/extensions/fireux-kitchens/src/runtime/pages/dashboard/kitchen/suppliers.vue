<template>
  <UDashboardPanel id="dashboard-kitchen-suppliers">
    <template #header>
      <LayoutsDashboardNavbar title="Suppliers" />
    </template>

    <template #body>
      <section class="space-y-4">
        <div class="text-xs text-dimmed">
          Mode: <span class="font-medium">{{ mode }}</span>
        </div>

        <UAlert
          color="neutral"
          variant="soft"
          title="Page stub"
          description="Temporarily stubbed while we build from Ingredients and Mise foundations."
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useRuntimeKitchen } from '../../../composables/fireux/app/runtime-kitchen/useRuntimeKitchen'

definePageMeta({
  layout: 'kitchen-dashboard',
  nav: {
    key: 'dashboard-kitchen-suppliers',
    label: 'Suppliers',
    icon: 'i-lucide-store',
    order: 11,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeKitchen()
const mode = runtime.mode
</script>
