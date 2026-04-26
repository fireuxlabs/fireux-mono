<template>
  <UDashboardPanel id="console-supplier-catalogue">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier Catalogue" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UAlert
          v-if="!selectedSupplier"
          color="neutral"
          variant="soft"
          title="No supplier selected"
          description="Select a supplier on /console/supplier before opening the supplier catalogue."
          :actions="[
            {
              label: 'Go to suppliers',
              to: '/console/supplier',
              icon: 'i-lucide-arrow-right',
            },
          ]"
        />

        <template v-else>
          <ConsoleSupplierCatalogue />
        </template>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useSupplierConsole } from '../../../composables/fireux/app/supplier-console/useSupplierConsole'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-suppliers'] },
    key: 'console-supplier-catalogue',
    label: 'Catalogue',
    icon: 'i-lucide-package-search',
    position: 'top',
    requiresSelection: true,
    order: 1,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { selectedSupplier } = useSupplierConsole()
</script>
