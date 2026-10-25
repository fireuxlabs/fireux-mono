<template>
  <WorkspaceHero
    compact
    title="Blank Team"
    description="Blank workspace team."
  />
  <WorkspaceBlankSelector />
  <WorkspaceAI compact aria-label="Blank Team AI"
    ><UAlert title="Team AI is not connected yet" color="neutral" />
  </WorkspaceAI>
  <section class="space-y-4">
    <WorkspaceBlankTeam :team="team" />
  </section>
</template>

<script setup lang="ts">
import { useBlankWorkspaceTeam } from '../../../composables/workspace/useBlankWorkspaceTeam'
const team = useBlankWorkspaceTeam()
definePageMeta({
  layout: false,
  workspacePage: true,
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
