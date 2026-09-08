<template>
  <UDashboardPanel id="workspace-project-team">
    <template #header>
      <LayoutsWorkspaceNavbar :title="intro.title">
        <template #right><WorkspaceIntroInfo :intro="liveIntro" /></template>
      </LayoutsWorkspaceNavbar>
      <UDashboardToolbar :ui="{ root: 'border-b-0' }"><UTabs
          v-if="team.state.value.team.members.length"
          :model-value="team.state.value.team.selectedTeamMemberId"
          :items="team.state.value.team.members.map(member => ({ label: member.name, value: member.id }))"
          :content="false" variant="link" size="sm" aria-label="Select Team member"
          @update:model-value="team.natives.select(String($event))"
        /></UDashboardToolbar>
    </template>
    <template #body>
      <WorkspaceHero compact :title="intro.title" :description="intro.purpose" />
      <WorkspaceProjectTeamAI
        :team="team"
        @action="teamView?.openAction($event)"
      />
      <WorkspaceProjectTeam
        :key="team.state.value.project.id"
        ref="teamView"
        :team="team"
      />
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
import { useProjectTeam } from 'fireux-core/runtime/project/composables/useProjectTeam'

const intro = {
  title: 'Project Team',
  purpose: 'Add people to your team, update their details and assign roles.',
  data: 'People, linked accounts, assigned roles.',
  boundaries:
    'Team changes follow the selected workspace’s membership authority and subscription limits.',
  ai: 'AI prepares the same Team controls used on this page. You review and confirm changes.',
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
