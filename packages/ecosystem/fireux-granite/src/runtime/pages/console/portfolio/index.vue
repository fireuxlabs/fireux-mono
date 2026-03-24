<template>
  <UDashboardPanel id="console-portfolio-entry">
    <template #header>
      <LayoutsConsoleNavbar title="Portfolio Console" />
    </template>

    <template #body>
      <section class="space-y-4">
        <p class="text-sm text-dimmed">
          Choose a live portfolio, open a read-only scenario, or jump into a test portfolio.
        </p>

        <PortfolioCTA />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import PortfolioCTA from 'fireux-properties/runtime/components/organisms/Portfolio/CTA.vue'

definePageMeta({
  layout: 'console',
  requiresAuth: true,
})
</script>
