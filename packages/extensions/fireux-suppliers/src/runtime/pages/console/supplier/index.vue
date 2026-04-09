<template>
  <UDashboardPanel id="console-supplier-home">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier">
        <template #right>
          <UButton
            v-if="supplierState.id"
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            @click="clearSelection"
          >
            Clear
          </UButton>
        </template>
      </LayoutsConsoleNavbar>
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleSupplier />
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
    key: 'console-supplier',
    label: 'Supplier',
    icon: 'i-lucide-truck',
    position: 'bottom',
    requiresSelection: false,
    order: 900,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { supplierState, consoleState } = useSupplierConsole({ publishHeader: true })
const clearSelection = consoleState.clearSelection
</script>
