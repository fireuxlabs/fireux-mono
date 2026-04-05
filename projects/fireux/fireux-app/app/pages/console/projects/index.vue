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

const { runtime, console } = useRuntimeProjectConsole({ publishHeader: true })
const selectedMode = console.mode
const modeOptions = console.modeOptions
const selectMode = console.selectMode
const clearSelection = console.clearSelection
</script>
