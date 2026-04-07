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
        <ConsolePortfolioReal />
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

const { runtime, consoleState } = usePortfolioConsole({ publishHeader: true })
const clearSelection = consoleState.clearSelection
</script>
