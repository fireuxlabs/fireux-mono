<template>
  <UDashboardPanel id="workspace-kitchen-index" :ui="{ body: 'pt-0 sm:pt-0' }">
    <template #header>
      <LayoutsWorkspaceNavbar :title="intro.title"
        ><template #right><WorkspaceIntroInfo :intro="intro" /></template
      ></LayoutsWorkspaceNavbar>
    </template>
    <template #body>
      <WorkspaceKitchenSelector :show-upgrade="false" />
      <WorkspaceFreemium
        family="kitchen"
        capability="landing"
        page-label="Workspace"
        placement="top"
        hide-description
      />
      <WorkspaceStart
        v-bind="experience"
        :selected-name="selectedName"
        :scope-key="`kitchen:${index.selectedId.value || 'guest'}`"
        @state="draftState = $event"
      >
        <template #primitives><WorkspaceKitchen /></template>
      </WorkspaceStart>
      <WorkspaceDiscover
        family="kitchen"
        title="More ways to work with Misebox"
        description="Explore the tools around your kitchen, from menus to guest experiences."
        :resource="{
          title: 'A guide for Airbnb guests',
          description: 'Explore a guest-facing food ordering experience.',
          to: '/ordering/airbnb-guest-guide',
        }"
      />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import WorkspaceDiscover from 'fireux-core/runtime/components/Workspace/Discover.vue'
import WorkspaceStart from 'fireux-core/runtime/components/Workspace/Start.vue'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import { useKitchenWorkspaceIndex } from 'fireux-kitchens/runtime/kitchen/composables/workspace/index/useKitchenWorkspaceIndex'
const index = useKitchenWorkspaceIndex()
const selectedName = computed(
  () =>
    index.collection.value.find((item) => item.id === index.selectedId.value)
      ?.display_name || ''
)
const draftState = ref({ draft: '', sendAttempted: false })
const pageState = useWorkspacePageState('kitchen')
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
  title: 'What’s cooking today?',
  description: 'Your menus, your team, your next service.',
  placeholder:
    'We’re adding three summer pizzas. Help me think through the menu and prep…',
  toolsTitle: 'Get straight to work',
  toolsDescription:
    'Open a useful tool. Menus, recipes and the rest of your kitchen stay close in the sidebar.',
  workflowsTitle: 'Plan the work between the tools',
  prompts: [
    'Plan tonight’s service',
    'Refresh my menu',
    'Organise my kitchen team',
  ],
  tools: [
    {
      label: 'Work on your menus',
      description: 'Open your menus and work on what your guests will see.',
      icon: 'i-lucide-notebook-text',
      to: '/workspace/kitchen/menus',
    },
    {
      label: 'Organise your team',
      description: 'Keep people, job titles and kitchen access in one place.',
      icon: 'i-lucide-users',
      to: '/workspace/kitchen/team',
    },
    {
      label: 'Make this kitchen yours',
      description:
        'Review the venue, contact details and image that represent your kitchen.',
      icon: 'i-lucide-store',
      to: '/workspace/kitchen/identity',
    },
  ],
  workflows: [
    {
      label: 'Prepare for a service',
      description:
        'Bring the menu, people and preparation into one working brief.',
      icon: 'i-lucide-chef-hat',
      prompt:
        'For our next service…\nWe expect… guests.\nThe menu is…\nThe team available is…\nThe preparation we need is…',
    },
    {
      label: 'Introduce something new',
      description:
        'Think through a menu change before you update the kitchen’s records.',
      icon: 'i-lucide-utensils',
      prompt:
        'I want to add… to our menu.\nThe ingredients are…\nThe prep involved is…\nBefore we launch, we need to…',
    },
  ],
  label: 'Kitchen workspace',
  icon: 'i-lucide-chef-hat',
}
import WorkspaceFreemium from 'fireux-core/runtime/components/Workspace/Freemium.vue'
import WorkspaceIntroInfo from 'fireux-core/runtime/components/Workspace/IntroInfo.vue'

import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { appMeta } from '~/meta'

const intro = {
  title: 'Kitchen Workspace',
  purpose: 'Work on your kitchen, its people and its menus.',
  data: 'Workspace identities and your current selection.',
  boundaries:
    'Creation follows your workspace allowance. Selection does not change ownership or permissions.',
  ai: 'Draft a message or try a suggestion. Sending is not connected to AI yet and does not change workspace records.',
}

definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-kitchen',
    label: 'Kitchen',
    group: 'Workspace',
    description: 'Kitchen Workspace',
    icon: 'i-lucide-chef-hat',
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
