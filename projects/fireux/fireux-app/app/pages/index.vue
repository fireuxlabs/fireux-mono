<template>
  <UDashboardPanel id="workspace-project-index">
    <template #header>
      <LayoutsWorkspaceNavbar :title="intro.title"
        ><template #right><WorkspaceIntroInfo :intro="intro" /></template
      ></LayoutsWorkspaceNavbar>
    </template>
    <template #body>
      <WorkspaceProjectSelector :show-upgrade="false" />
      <WorkspaceFreemium
        family="project"
        capability="landing"
        page-label="Workspace"
        placement="top"
      />
      <WorkspaceStart
        v-bind="experience"
        :selected-name="selectedName"
        :scope-key="`project:${index.selectedId.value || 'guest'}`"
        @state="draftState = $event"
      >
        <template #primitives><WorkspaceProject /></template>
      </WorkspaceStart>
      <WorkspaceFreemium
        family="project"
        capability="landing"
        page-label="Workspace"
        placement="bottom"
      />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import WorkspaceStart from 'fireux-core/runtime/components/Workspace/Start.vue'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import { useProjectWorkspaceIndex } from 'fireux-core/runtime/project/composables/workspace/index/useProjectWorkspaceIndex'
const index = useProjectWorkspaceIndex()
const selectedName = computed(
  () =>
    index.collection.value.find((item) => item.id === index.selectedId.value)
      ?.name || ''
)
const draftState = ref({ draft: '', reviewing: false })
const pageState = useWorkspacePageState('project')
watchEffect(() =>
  pageState.publish({
    selection: { id: index.selectedId.value, name: selectedName.value },
    brief: draftState.value,
    derived: {
      status: index.outcome.value,
      mode: 'prototype',
      execution: 'draft-only',
    },
  })
)
const experience = {
  title: 'What will you build next?',
  description:
    'Shape an idea, improve an existing App, or organise the people behind it. Start where you are.',
  placeholder:
    'I’m building a SaaS for cleaning companies. Customers can have several sites…',
  toolsTitle: 'Move your project forward',
  toolsDescription:
    'A few useful places to start. Your other capabilities are in the sidebar.',
  workflowsTitle: 'From an idea to a clear next step',
  prompts: [
    'Describe my App idea',
    'Plan the next improvement',
    'Organise my project team',
  ],
  tools: [
    {
      label: 'Shape your identity',
      description:
        'Give your Project a name, a purpose and a recognisable image.',
      icon: 'i-lucide-fingerprint',
      to: '/workspace/project/identity',
    },
    {
      label: 'Bring your team together',
      description:
        'Manage people, responsibilities and access to this Project.',
      icon: 'i-lucide-users',
      to: '/workspace/project/team',
    },
    {
      label: 'Explore your Apps',
      description:
        'See the Apps connected to your Project and understand what already exists.',
      icon: 'i-lucide-panels-top-left',
      to: '/workspace/project/apps',
    },
  ],
  workflows: [
    {
      label: 'Plan a new App',
      description:
        'Describe the audience, their work and the capabilities they need.',
      icon: 'i-lucide-sparkles',
      prompt:
        'My App is for…\nThe people using it need to…\nThe first three things it should do are…',
    },
    {
      label: 'Improve what already exists',
      description:
        'Turn something you have noticed into a focused change brief.',
      icon: 'i-lucide-git-pull-request',
      prompt:
        'In my existing App…\nThe current experience is…\nI want it to work like…\nI will know it is right when…',
    },
  ],
  label: 'Project workspace',
  icon: 'i-lucide-briefcase-business',
  recordLabel: 'Your project',
  overviewTo: '/workspace/project/overview',
}
import WorkspaceFreemium from 'fireux-core/runtime/components/Workspace/Freemium.vue'
import WorkspaceIntroInfo from 'fireux-core/runtime/components/Workspace/IntroInfo.vue'

import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { appMeta } from '~/meta'

const intro = {
  title: 'Project Workspace',
  purpose: 'Work on your project workspace.',
  data: 'Workspace identities and your current selection.',
  boundaries:
    'Creation follows your workspace allowance. Selection does not change ownership or permissions.',
  ai: 'Write and review a working brief, then open a tool. This prototype does not generate answers or change workspace records.',
}

definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'project',
  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-project',
    label: 'Project',
    group: 'Workspace',
    description: 'Project Workspace',
    icon: 'i-lucide-briefcase-business',
    position: 'bottom',
    order: 900,
    prominent: true,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})

useAppLandingSeo({
  title: appMeta.seoHome.title,
  description: appMeta.seoHome.description,
  path: '/',
  logo: '/img/app/logo.png',
  language: 'en',
})
</script>
