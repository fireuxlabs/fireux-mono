<template>
  <div>
    <NuxtPage v-if="hasMemberRoute" />
    <UDashboardPanel v-else id="workspace-kitchen-team">
      <template #header>
        <LayoutsWorkspaceNavbar title="Team">
          <template #right
            ><WorkspaceKitchenCapabilityContextInfo operation="team"
          /></template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="workspace-surface">
          <div class="workspace-surface__split">
            <main class="workspace-surface__primary">
              <WorkspaceKitchenTeam v-if="hasTeam || teamPending" />
              <UAlert
                v-else
                color="neutral"
                variant="subtle"
                icon="i-lucide-users"
                title="No team members yet"
                description="Add the first person to begin this Kitchen Team."
              />
            </main>

            <aside class="workspace-surface__context" aria-label="Team tools">
              <div class="workspace-surface workspace-surface--compact">
                <WorkspaceKitchenTeamTools />
                <WorkspaceKitchenTeamAI />
              </div>
            </aside>
          </div>
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { provideKitchenWorkspaceTeam } from '../../../../kitchen/composables/workspace/team/useKitchenWorkspaceTeam'

const team = provideKitchenWorkspaceTeam()
const hasTeam = computed(() => team.teamMembers.value.length > 0)
const teamPending = team.pending
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
