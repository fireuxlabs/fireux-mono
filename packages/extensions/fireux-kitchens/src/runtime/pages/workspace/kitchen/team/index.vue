<template>
  <UDashboardPanel id="workspace-kitchen-team">
    <template #header>
      <LayoutsWorkspaceNavbar :title="intro.title"
        ><template #right><WorkspaceIntroInfo :intro="liveIntro" /></template
      ></LayoutsWorkspaceNavbar>
    </template>
    <template #body>
      <div class="flex items-start justify-between gap-3">
        <WorkspaceKitchenTeamSelector class="min-w-0 flex-1" :team="team" />
        <WorkspaceFreemium
          beside-selector
          family="kitchen"
          capability="team"
          :used-count="team.state.value.team.members.length"
          page-label="Team"
          placement="top"
        />
      </div>
      <WorkspaceHero
        compact
        :title="intro.title"
        :description="intro.purpose"
      />
      <WorkspaceKitchenTeamAI :team="team" @action="openAction" />

      <div class="space-y-5">
        <WorkspaceKitchenTeam
          :key="team.state.value.kitchen.id"
          ref="teamView"
          :role-labels="roleLabels"
          :team="team"
        >
          <template #block-heading>
            <h2 class="mb-4 text-xl font-semibold">Block one</h2>
          </template>
          <template #collection-heading>
            <h3 class="mb-4 text-base font-semibold">
              2.1 Block one left (collection)
            </h3>
          </template>
          <template #selected-heading>
            <h3 class="mb-4 text-base font-semibold">
              2.2 Block one right (selected team member)
            </h3>
          </template>
          <template #person-roles>
            <section v-if="rolesEditor" class="space-y-3">
              <h3 class="font-semibold">Assigned roles</h3>
              <div class="flex flex-wrap gap-2">
                <UCheckbox
                  v-for="role in rolesEditor.roles"
                  :key="role.id"
                  :label="role.name"
                  :model-value="rolesEditor.selected.includes(role.id)"
                  :disabled="
                    rolesEditor.busy ||
                    rolesEditor.pending ||
                    !team.state.value.team.selectedTeamMemberId
                  "
                  @update:model-value="rolesEditor.toggleRole(role.id)"
                />
              </div>
              <p v-if="!rolesEditor.roles.length" class="text-sm text-muted">
                Add roles in Team roles below.
              </p>
              <UButton
                v-if="rolesEditor.assignmentChanged"
                label="Save roles"
                :loading="rolesEditor.busy"
                @click="rolesEditor.saveAssignment()"
              />
            </section>
          </template>
        </WorkspaceKitchenTeam>

        <WorkspaceTeamRoles
          ref="rolesEditor"
          class="rounded-xl border border-default p-4"
          compact
          :workspace-name="team.state.value.kitchen.name"
          @labels="roleLabels = $event"
          v-if="team.derived.value.status === 'ready'"
          :workspace-id="team.state.value.kitchen.id"
          :member-id="team.state.value.team.selectedTeamMemberId"
          :member-name="
            team.state.value.team.members.find(
              (member) =>
                member.id === team.state.value.team.selectedTeamMemberId
            )?.name
          "
          endpoint="/api/workspace/kitchen/team/roles"
          :suggestions="[
            'Owner',
            'Head Chef',
            'Sous Chef',
            'Commis',
            'Kitchen Porter',
          ]"
        />
      </div>
      <WorkspaceKitchenTeamDiscovery compact />
      <WorkspaceFreemium
        family="kitchen"
        capability="team"
        :used-count="team.state.value.team.members.length"
        page-label="Team"
        placement="bottom"
      />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import WorkspaceTeamRoles from 'fireux-core/runtime/components/Workspace/Team/Roles.vue'
import type { TeamAIIntent as KitchenTeamIntent } from 'fireux-core/runtime/composables/fireux/useTeam'
function openAction(intent: KitchenTeamIntent) {
  teamView.value?.openAction(intent)
}

import WorkspaceKitchenTeam from '../../../../kitchen/components/Workspace/Team/Index.vue'
const rolesEditor = ref<InstanceType<typeof WorkspaceTeamRoles>>()
const roleLabels = ref<Record<string, string[]>>({})
const teamView = ref<InstanceType<typeof WorkspaceKitchenTeam>>()
import WorkspaceFreemium from 'fireux-core/runtime/components/Workspace/Freemium.vue'
import WorkspaceIntroInfo from 'fireux-core/runtime/components/Workspace/IntroInfo.vue'

import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useKitchenTeam } from '../../../../kitchen/composables/useKitchenTeam'

import { kitchenTeamAgentTools } from '../../../../kitchen/tools/team'

const primitiveLabels: Record<string, string> = {
  'create-member': 'Create',
  'read-members': 'Read',
  'update-member': 'Update',
  'delete-member': 'Delete — remove',
}
const intro = {
  title: 'Kitchen Team',
  purpose:
    'Manage the people and roles in this kitchen workspace.',
  data: 'People, optional linked accounts, assigned workspace roles.',
  boundaries:
    'Team changes follow the selected workspace’s membership authority and subscription limits. Creating a member focuses their live record; Read changes local focus without changing membership.',
  tools: kitchenTeamAgentTools
    .filter((tool) => primitiveLabels[tool.id.replace('kitchen.team.', '')])
    .map((tool) => ({
      id: tool.id,
      label: primitiveLabels[tool.id.replace('kitchen.team.', '')]!,
      description: `${tool.context.instruction} ${tool.context.outcome}`,
    })),
  ai: 'AI prepares the same Create, Read, Update and Remove dialogs as the human controls. Review and confirm changes yourself.',
}

const team = useKitchenTeam()
const liveIntro = computed(() => ({
  ...intro,
  status: team.derived.value.status,
  recordCount: team.state.value.team.members.length,
  tools: [
    ...intro.tools.map((tool) => ({
      ...tool,
      available: team.derived.value.capability.availableActions.includes(
        tool.id
          .replace('kitchen.team.', '')
          .replace('-members', '')
          .replace('-member', '') as 'create' | 'read' | 'update' | 'delete'
      ),
    })),
  ],
}))
const { appName } = useFireUXConfig()

definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-team',
    label: 'Team',
    group: 'Workspace',
    description: 'Kitchen Team',
    icon: 'i-lucide-users',
    position: 'top',
    order: 6,
    prominent: false,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})

useAppLandingSeo({
  title: `Team | ${appName}`,
  description:
    'Review the people connected to this Kitchen and their Team roles.',
  path: '/workspace/kitchen/team',
  logo: '/img/app/logo.png',
  language: 'en',
})
</script>
