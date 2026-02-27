<template>
  <UDashboardPanel id="home">
    <template #header>
      <LayoutsConsoleNavbar title="Overview" :ui="{ right: 'gap-3' }" />
    </template>

    <template #body>
      <div class="panels-stack">
        <div class="panels-grid-3">
          <ConsoleOverviewCore class="console-item" />
          <ConsoleOverviewEcosystem class="console-item" />
          <ConsoleOverviewApp class="console-item" />
        </div>

        <div class="panels-grid-2">
          <ConsoleOverviewDomainEcosystem class="console-item" />
          <ConsoleOverviewDomainApp class="console-item" />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports';

definePageMeta({
  nav: {
    key: 'console-home',
    label: 'Overview',
    icon: 'i-lucide-terminal',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  layout: 'console',
})

</script>
