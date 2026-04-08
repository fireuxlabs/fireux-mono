<template>
  <UDashboardPanel id="console-supplier-overview">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier Overview" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UAlert
          v-if="!supplierState.id"
          color="neutral"
          variant="soft"
          title="No supplier selected"
          description="Select a supplier on /console/supplier before opening the supplier overview."
          :actions="[
            {
              label: 'Go to suppliers',
              to: '/console/supplier',
              icon: 'i-lucide-arrow-right',
            },
          ]"
        />

        <template v-else>
          <SupplierCardsPill
            v-if="supplier"
            v-bind="supplier"
            :link="false"
            :show-badges="false"
          />

          <ConsoleSupplierOverview />
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
    key: 'console-supplier-overview',
    label: 'Overview',
    icon: 'i-lucide-house',
    order: 0,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { supplierState, supplier } = useSupplierConsole({
  publishHeader: true,
})
</script>
