<template>
  <UDashboardPanel id="console-portfolio-home">
    <template #header>
      <LayoutsConsoleNavbar title="Portfolio">
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

        <ConsolePortfolioDemo v-if="selectedMode === 'demo'" />
        <ConsolePortfolioReal v-else-if="selectedMode === 'live'" />
        <ConsolePortfolioTest v-else />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { usePortfolioConsole } from '../../../composables/fireux/app/portfolio-console/usePortfolioConsole'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-portfolio',
    label: 'Portfolio',
    icon: 'i-lucide-layout-dashboard',
    order: 900,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { runtime, console } = usePortfolioConsole({ publishHeader: true })
const selectedMode = console.mode
const modeOptions = console.modeOptions
const selectMode = console.selectMode
const clearSelection = console.clearSelection
</script>
