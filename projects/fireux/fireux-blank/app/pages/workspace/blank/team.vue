<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-blank-team">
      <template #header>
        <WorkspaceNavbar title="Blank Team" />
      </template>

      <template #body>
        <WorkspaceHero compact title="Blank Team" description="Blank workspace team." />
        <WorkspaceBlankSelector />
        <WorkspaceAI compact aria-label="Blank Team AI"><UAlert title="Team AI is not connected yet" color="neutral" /></WorkspaceAI>
        <section class="space-y-4">
          <WorkspaceBlankTeam :team="team" />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { useBlankTeam } from '../../../composables/useBlankTeam'
const team = useBlankTeam()
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-blank-team',
    label: 'Team',
    icon: 'i-lucide-users',
    position: 'top',
    order: 6,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
