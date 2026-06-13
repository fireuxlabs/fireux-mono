<template>
  <UDashboardPanel id="console-portfolio-create">
    <template #header>
      <LayoutsConsoleNavbar title="Create Portfolio" />
    </template>

    <template #body>
      <section class="space-y-4">
        <PortfolioCreateSystem
          v-if="canCreate"
          mode="console"
          return-to="/console/portfolio"
          cancel-to="/console/portfolio"
        />

        <UPageCard
          v-else
          title="Portfolio creation is not enabled here"
          description="This app uses existing Portfolio console targets."
          variant="subtle"
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConsoleConfig } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'

const { canCreateTarget } = useConsoleConfig('portfolio')
const canCreate = computed(() => canCreateTarget())

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-portfolio-create',
    label: 'Create',
    icon: 'i-lucide-plus',
    position: 'bottom',
    requiresSelection: false,
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
