<template>
  <UDashboardPanel id="console-portfolio-create">
    <template #header>
      <LayoutsConsoleNavbar title="Create Portfolio" />
    </template>

    <template #body>
      <section class="space-y-8">
        <UCard>
          <template #header>
            <div class="space-y-1">
              <div class="text-sm font-semibold">Portfolio details</div>
              <div class="text-xs text-dimmed">
                Create a portfolio and continue into the portfolio console.
              </div>
            </div>
          </template>

          <PortfolioCreateSystem return-to="/console/portfolio/overview" />
        </UCard>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import PortfolioCreateSystem from 'fireux-properties/runtime/components/organisms/Portfolio/Create/System.vue'

definePageMeta({
  layout: 'granite-console',
  requiresAuth: true,
})
</script>
