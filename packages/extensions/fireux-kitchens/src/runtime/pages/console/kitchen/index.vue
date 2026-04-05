<template>
  <UDashboardPanel id="console-kitchen-home">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen">
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

        <ConsoleKitchenDemo v-if="selectedMode === 'demo'" />
        <ConsoleKitchenReal v-else-if="selectedMode === 'live'" />
        <ConsoleKitchenTest v-else />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useRuntimeKitchenSelection } from '../../../composables/fireux/app/kitchen-runtime/state'
import { useRuntimeKitchenConsole } from '../../../composables/fireux/app/kitchen-runtime/useRuntimeKitchenConsole'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen',
    label: 'Kitchen',
    icon: 'i-lucide-chef-hat',
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

const { runtime } = useRuntimeKitchenConsole()
const kitchenSelection = useRuntimeKitchenSelection()
const selectedMode = kitchenSelection.mode

type ConsoleMode = (typeof modeOptions)[number]['value']

const isConsoleMode = (value: string): value is ConsoleMode =>
  modeOptions.some((option) => option.value === value)

const selectMode = (value: string) => {
  if (!isConsoleMode(value)) return

  kitchenSelection.setRuntimeKitchen({
    mode: value,
  })
}

const clearSelection = () => {
  kitchenSelection.setRuntimeKitchen({
    selectedId: '',
    mode: selectedMode.value,
  })
}
</script>
