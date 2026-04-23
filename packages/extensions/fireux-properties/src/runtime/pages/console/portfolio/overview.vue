<template>
  <UDashboardPanel id="console-portfolio-overview">
    <template #header>
      <LayoutsConsoleNavbar title="Portfolio Overview" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UAlert
          v-if="!selectedPortfolio"
          color="neutral"
          variant="soft"
          title="No portfolio selected"
          description="Select a portfolio on /console/portfolio before opening the portfolio overview."
          :actions="[
            {
              label: 'Go to portfolios',
              to: '/console/portfolio',
              icon: 'i-lucide-arrow-right',
            },
          ]"
        />

        <template v-else>
          <ConsolePortfolioOverview />
        </template>
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
    key: 'console-portfolio-overview',
    label: 'Overview',
    icon: 'i-lucide-house',
    position: 'top',
    requiresSelection: true,
    order: 0,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { selectedPortfolio } = usePortfolioConsole({
  publishHeader: true,
})
</script>
