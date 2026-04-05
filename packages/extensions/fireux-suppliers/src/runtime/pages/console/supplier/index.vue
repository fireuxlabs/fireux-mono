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
        <SegmentedToggle
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
import { useRuntimeSupplierSelection } from '../../../composables/fireux/app/supplier-console/state'
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

const modeOptions = [
  { value: 'demo', label: 'Demo' },
  { value: 'live', label: 'Real' },
  { value: 'test', label: 'Test' },
] as const

const { runtime } = useRuntimeSupplierConsole()
const supplierSelection = useRuntimeSupplierSelection()
const selectedMode = supplierSelection.mode

type ConsoleMode = (typeof modeOptions)[number]['value']

const isConsoleMode = (value: string): value is ConsoleMode =>
  modeOptions.some((option) => option.value === value)

const selectMode = (value: string) => {
  if (!isConsoleMode(value)) return

  supplierSelection.setRuntimeSupplier({
    mode: value,
  })
}

const clearSelection = () => {
  supplierSelection.setRuntimeSupplier({
    selectedId: '',
    mode: selectedMode.value,
  })
}
</script>
