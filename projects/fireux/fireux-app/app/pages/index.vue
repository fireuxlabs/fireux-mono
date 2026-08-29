<template>
  <UDashboardPanel id="fireux-project-home">
    <LayoutsWorkspaceNavbar title="Project Workspace">
      <template
        v-if="derived.outcome === 'pending' || derived.hasSelection"
        #title
      >
        <WorkspaceProjectActive :project="state.project" />
      </template>
      <template #right>
        <!-- 07 Info — LAST: explain how the completed page, context, capabilities and boundaries fit together. -->
        <WorkspaceProjectInfo />
      </template>
    </LayoutsWorkspaceNavbar>
    <!-- 03 Workspace — select the active Project or create one when the subscription permits. -->
    <WorkspaceProject
      :state="state"
      :derived="derived"
      :refresh="actions.refresh"
    />
    <!-- 01 Hero — define the Project page promise, audience and intended outcome. -->
    <WorkspaceProjectHero />
    <!-- 02 AI — provide the page-scoped ProjectAI entry with only the context and actions this page proves. -->
    <WorkspaceProjectIndexAI
      :workspace-state="state"
      :workspace-derived="derived"
    />
    <!-- 04 Operations — curate only the main Project index Operations; capability pages own WorkspaceProjectXOperations. -->
    <WorkspaceProjectOperations />
    <!-- 05 Tools — expose only bounded Tools beneath the featured capabilities; capability pages own WorkspaceProjectXTools. -->
    <WorkspaceProjectTools :state="state" :derived="derived" />
    <!-- 06 Discovery — publish demand-led literature and SEO for this exact index; capability pages own WorkspaceProjectXDiscovery. -->
    <WorkspaceProjectDiscovery />
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useProjectWorkspaceIndex } from 'fireux-core/runtime/project/composables/workspace/index/useProjectWorkspaceIndex'
import { appMeta } from '../meta'

const { state, derived, actions } = useProjectWorkspaceIndex()

definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'project',
  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-project',
    label: 'Project',
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
