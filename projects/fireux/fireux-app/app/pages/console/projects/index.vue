<template>
  <UDashboardPanel id="console-project-home">
    <template #header>
      <LayoutsConsoleNavbar title="Projects">
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

        <ConsoleProjectDemo v-if="selectedMode === 'demo'" />
        <ConsoleProjectReal v-else-if="selectedMode === 'live'" />
        <ConsoleProjectTest v-else />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useRuntimeProjectSelection } from '~/composables/console/project/state'
import { useRuntimeProjectConsole } from '~/composables/console/project/useRuntimeProjectConsole'

definePageMeta({
  layout: 'console',
  nav: {
    key: 'console-projects',
    label: 'Projects',
    icon: 'i-lucide-briefcase-business',
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

type ConsoleMode = (typeof modeOptions)[number]['value']

const { runtime } = useRuntimeProjectConsole()
const projectSelection = useRuntimeProjectSelection()
const selectedMode = projectSelection.mode

const isConsoleMode = (value: string): value is ConsoleMode =>
  modeOptions.some((option) => option.value === value)

const selectMode = (value: string) => {
  if (!isConsoleMode(value)) return

  projectSelection.setRuntimeProject({
    mode: value,
  })
}

const clearSelection = () => {
  projectSelection.setRuntimeProject({
    selectedId: '',
    mode: selectedMode.value,
  })
}
</script>
