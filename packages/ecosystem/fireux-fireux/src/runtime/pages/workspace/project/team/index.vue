<template>
  <UDashboardPanel id="workspace-project-team">
    <template #header>
      <LayoutsWorkspaceNavbar :title="intro.title"
        ><template #right><WorkspaceIntroInfo :intro="liveIntro" /></template
      ></LayoutsWorkspaceNavbar>
    </template>
    <template #body>
      <div class="flex items-start justify-between gap-3">
        <WorkspaceProjectTeamSelector class="min-w-0 flex-1" :team="team" />
        <WorkspaceFreemium
          beside-selector
          family="project"
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
      <WorkspaceProjectTeamAI
        :team="team"
        @action="teamView?.openAction($event)"
      />

      <WorkspaceProjectTeam
        :key="team.state.value.project.id"
        ref="teamView"
        :team="team"
      />
      <WorkspaceProjectTeamTools />
      <WorkspaceProjectTeamDiscovery />
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
import WorkspaceProjectTeam from 'fireux-core/runtime/project/components/Workspace/Team/Index.vue'
const teamView = ref<InstanceType<typeof WorkspaceProjectTeam>>()
import WorkspaceFreemium from 'fireux-core/runtime/components/Workspace/Freemium.vue'
import WorkspaceIntroInfo from 'fireux-core/runtime/components/Workspace/IntroInfo.vue'

import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useProjectWorkspaceTeam } from 'fireux-core/runtime/project/composables/workspace/team/useProjectWorkspaceTeam'

const intro = {
  title: 'Project Team',
  purpose:
    'Manage the people and access associated with this project workspace.',
  data: 'Active Team members, optional job titles and access roles. Job titles do not grant permissions.',
  boundaries:
    'Team changes follow the selected workspace’s membership authority and subscription limits.',
  ai: 'AI interprets requests and prepares the same Create, Read, Update and Deactivate dialogs. You review and confirm changes.',
}

const team = useProjectWorkspaceTeam()
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
        'Review and confirm the selected member’s name, job title and access role.',
    },
    {
      id: 'delete',
      label: 'Delete — deactivate',
      description: 'End active membership while preserving the record.',
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
