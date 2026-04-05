<template>
  <UDashboardPanel id="console-supplier-home">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier">
        <template #right>
          <UButton
            v-if="runtime.id"
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
        <MoleculesSegmentedToggle
          :model-value="selectedMode"
          :options="modeOptions"
          label="Mode"
          @update:model-value="selectMode"
        />

        <ConsoleSupplierDemo v-if="selectedMode === 'demo'" />
        <ConsoleSupplierReal v-else-if="selectedMode === 'live'" />
        <ConsoleSupplierTest v-else />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useRuntimeSupplierConsole } from '../../../composables/fireux/app/supplier-console/useRuntimeSupplierConsole'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-suppliers'] },
    key: 'console-supplier',
    label: 'Supplier',
    icon: 'i-lucide-truck',
    order: 900,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { runtime, console } = useRuntimeSupplierConsole({ publishHeader: true })
const selectedMode = console.mode
const modeOptions = console.modeOptions
const selectMode = console.selectMode
const clearSelection = console.clearSelection
</script>
