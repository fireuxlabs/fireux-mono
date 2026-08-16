<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConsole } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'

const { canCreateTarget } = useConsole('portfolio')
const canCreate = computed(() => canCreateTarget())

definePageMeta({
  layout: 'console',
  consoleSurface: 'create',
  visibility: { modules: ['fireux-properties'] },
  nav: {
    key: 'console-portfolio-create',
    label: 'Create',
    icon: 'i-lucide-plus',
    position: 'bottom',
    hidden: true,
    order: 5,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: false,
})
</script>
