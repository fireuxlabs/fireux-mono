<template>
  <UDashboardPanel id="workspace-project-team">
    <template #header>
      <LayoutsWorkspaceNavbar :title="intro.title"
        ><template #right><WorkspaceIntroInfo :intro="liveIntro" /></template
      ></LayoutsWorkspaceNavbar>
    </template>
    <template #body>
      <details class="mb-4">
        <summary class="cursor-pointer text-sm font-medium">
          Ask Project Team AI
        </summary>
        <WorkspaceProjectTeamAI
          :team="team"
          @action="teamView?.openAction($event)"
        />
      </details>
      <div class="space-y-5">
        <WorkspaceProjectTeam
          :key="team.state.value.project.id"
          ref="teamView"
          :role-labels="roleLabels"
          :team="team"
        >
          <template #person-roles>
            <WorkspaceTeamAssignment
              :editor="rolesEditor"
              :member-id="team.state.value.team.selectedTeamMemberId"
            />
          </template>
        </WorkspaceProjectTeam>
        <WorkspaceTeamRoles
          ref="rolesEditor"
          compact
          class="rounded-xl border border-default p-4"
          :workspace-name="team.state.value.project.name"
          @labels="roleLabels = $event"
          v-if="team.derived.value.status === 'ready'"
          :workspace-id="team.state.value.project.id"
          :member-id="team.state.value.team.selectedTeamMemberId"
          :member-name="
            team.state.value.team.members.find(
              (member) =>
                member.id === team.state.value.team.selectedTeamMemberId
            )?.name
          "
          :endpoint="`/api/internal/control/projects/${encodeURIComponent(team.state.value.project.id)}/roles`"
          :suggestions="[
            'Owner',
            'Project Manager',
            'Designer',
            'Contributor',
            'Tester',
          ]"
        />
      </div>
      <WorkspaceFreemium
        family="project"
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
import WorkspaceProjectTeam from 'fireux-core/runtime/project/components/Workspace/Team/Index.vue'
const rolesEditor = ref<InstanceType<typeof WorkspaceTeamRoles>>()
const roleLabels = ref<Record<string, string[]>>({})
const teamView = ref<InstanceType<typeof WorkspaceProjectTeam>>()
import WorkspaceFreemium from 'fireux-core/runtime/components/Workspace/Freemium.vue'
import WorkspaceIntroInfo from 'fireux-core/runtime/components/Workspace/IntroInfo.vue'

import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useProjectTeam } from 'fireux-core/runtime/project/composables/useProjectTeam'

const intro = {
  title: 'Project Team',
  purpose: 'Manage the people and roles in this project workspace.',
  data: 'People, linked accounts, assigned roles.',
  boundaries:
    'Team changes follow the selected workspace’s membership authority and subscription limits.',
  ai: 'AI interprets requests and prepares the same Create, Read, Update and Remove dialogs. You review and confirm changes.',
}

const team = useProjectTeam()
const liveIntro = computed(() => ({
  ...intro,
  status: team.derived.value.status,
  recordCount: team.state.value.team.members.length,
  tools: [
    {
      id: 'create',
      label: 'Create',
      description: 'Add a named person or link an existing User.',
    },
    {
      id: 'read',
      label: 'Read',
      description:
        'Review the collection and select a member without changing membership.',
    },
    {
      id: 'update',
      label: 'Update',
      description:
        'Update the selected member’s name, and assign workspace roles.',
    },
    {
      id: 'delete',
      label: 'Delete — remove',
      description: 'Remove the person from this team.',
    },
  ].map((tool) => ({
    ...tool,
    available: team.derived.value.capability.availableActions.includes(
      tool.id as 'create' | 'read' | 'update' | 'delete'
    ),
  })),
}))
const { appName } = useFireUXConfig()

definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'project',
  workspaceSurface: 'browse',
  visibility: { ecosystems: ['fireux'] },
  nav: {
    key: 'workspace-project-team',
    label: 'Team',
    group: 'Workspace',
    description: 'Project Team',
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
    'Review the people connected to this Project and their Team roles.',
  path: '/workspace/project/team',
  logo: '/img/app/logo.png',
  language: 'en',
})
</script>
