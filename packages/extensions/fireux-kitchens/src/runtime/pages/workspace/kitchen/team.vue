<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <NuxtPage v-if="hasMemberRoute" />
    <UDashboardPanel v-else id="workspace-kitchen-team">
      <template #header>
        <LayoutsWorkspaceNavbar title="Team" />
      </template>

      <template #body>
        <section class="workspace-surface">
          <WorkspaceKitchenTeamToolMap />
          <WorkspaceKitchenTeamTools />
          <WorkspaceKitchenTeamAI />
          <WorkspaceKitchenTeam v-if="hasTeam" />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { provideKitchenWorkspaceTeam } from '../../../kitchen/composables/workspace/team/useKitchenWorkspaceTeam'

const team = provideKitchenWorkspaceTeam()
const hasTeam = computed(() => team.teamMembers.value.length > 0)
const memberSlug = useRouteParam('memberSlug')
const hasMemberRoute = computed(() => Boolean(memberSlug.value))

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-team',
    label: 'Team',
    group: 'Workspace',
    icon: 'i-lucide-users',
    position: 'top',
    order: 6,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
