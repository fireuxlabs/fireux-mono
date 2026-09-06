<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-team-member-detail">
      <template #header>
        <LayoutsWorkspaceNavbar title="Team member" />
      </template>

      <template #body>
        <section class="workspace-surface">
          <UButton
            label="Back to Team"
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            to="/workspace/kitchen/team"
            class="w-fit"
          />

          <USkeleton v-if="pending" class="h-64 w-full rounded-xl" />
          <WorkspaceKitchenTeamDetail v-else-if="member" :member="member" />
          <UAlert
            v-else
            color="neutral"
            variant="soft"
            title="Team member not found"
            description="This member is not in the selected Kitchen Team."
          />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useKitchenTeam } from '../../../../kitchen/composables/useKitchenTeam'

const { teamMembers, pending } = useKitchenTeam()
const memberId = useRouteParam('memberId')
const member = computed(() =>
  teamMembers.value.find((candidate) => candidate.id === memberId.value)
)

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'detail',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
  nav: {
    key: 'workspace-kitchen-team-member-detail',
    label: 'Team member detail',
    icon: 'i-lucide-user-round',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['workspace'],
  },
})
</script>
