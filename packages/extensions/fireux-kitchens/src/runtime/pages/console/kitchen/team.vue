<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-kitchen-team">
      <template #header>
        <LayoutsConsoleNavbar title="Team" />
      </template>

      <template #body>
        <section class="console-surface">
          <ConsoleKitchenTeamTools />
          <ConsoleKitchenTeamAI />
          <ConsoleKitchenTeam v-if="hasTeam" />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { provideKitchenConsoleTeam } from '../../../composables/fireux/console/kitchen/team/useKitchenConsoleTeam'

const team = provideKitchenConsoleTeam()
const hasTeam = computed(() => team.teamMembers.value.length > 0)

definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'console-kitchen-team',
    label: 'Team',
    icon: 'i-lucide-users',
    position: 'top',
    order: 6,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
