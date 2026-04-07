<template>
  <UDashboardPanel id="console-portfolio-overview">
    <template #header>
      <LayoutsConsoleNavbar title="Portfolio Overview" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UAlert
          v-if="!runtime.id"
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
          <div class="flex flex-wrap items-center gap-3">
            <PortfolioCardsPill
              v-if="activePortfolioPill"
              v-bind="activePortfolioPill"
              :link="false"
              :show-badges="false"
            />
            <UBadge color="neutral" variant="soft" size="lg">
              {{ modeLabel }} Mode
            </UBadge>
          </div>

          <ConsolePortfolioOverviewDemo v-if="runtimeMode === 'demo'" />
          <ConsolePortfolioOverviewReal v-else-if="runtimeMode === 'live'" />
          <ConsolePortfolioOverviewTest v-else />

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Portfolio Areas</div>
            </template>

            <div class="flex flex-wrap gap-2">
              <UButton
                to="/console/portfolio/properties"
                color="neutral"
                variant="soft"
                icon="i-lucide-building"
              >
                Properties
              </UButton>
              <UButton
                to="/console/portfolio/clients"
                color="neutral"
                variant="soft"
                icon="i-lucide-users"
              >
                Clients
              </UButton>
              <UButton
                to="/console/portfolio/incidents"
                color="neutral"
                variant="soft"
                icon="i-lucide-triangle-alert"
              >
                Incidents
              </UButton>
              <UButton
                to="/console/portfolio/finance"
                color="neutral"
                variant="soft"
                icon="i-lucide-wallet"
              >
                Finance
              </UButton>
              <UButton
                to="/console/portfolio"
                color="neutral"
                variant="ghost"
                icon="i-lucide-refresh-cw"
              >
                Switch portfolio
              </UButton>
            </div>
          </UCard>
        </template>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePortfolioConsole } from '../../../composables/fireux/app/portfolio-console/usePortfolioConsole'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-portfolio-overview',
    label: 'Overview',
    icon: 'i-lucide-house',
    order: 0,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { runtime, console, activePortfolioPill } = usePortfolioConsole({
  publishHeader: true,
})
const runtimeMode = console.mode

const modeLabel = computed(() => {
  if (runtimeMode.value === 'live') return 'Real'
  if (runtimeMode.value === 'test') return 'Test'
  return 'Demo'
})
</script>
