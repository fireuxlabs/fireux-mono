<template>
  <UDashboardPanel id="workspace-project-index">
    <template #header>
      <LayoutsWorkspaceNavbar :title="intro.title"
        ><template #right
          ><WorkspaceIntroInfo
            :intro="intro"
            workspace="project"
            :show-structured-details="false" /></template
      ></LayoutsWorkspaceNavbar>
      <UDashboardToolbar :ui="{ root: 'border-b-0' }"
        ><WorkspaceProjectSelector
      /></UDashboardToolbar>
    </template>
    <template #body>
      <WorkspaceHero
        compact
        :title="intro.title"
        :description="intro.purpose"
      />
      <WorkspaceProjectLandingAI
        :perform-action="performLandingAction"
        :can-prepare-app="canPrepareApp"
      />
      <WorkspaceProject
        ref="surface"
        :publication="appContext.publication.value"
      />
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
import WorkspaceIntroInfo from 'fireux-core/runtime/components/Workspace/IntroInfo.vue'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { appMeta } from '~/meta'
import { useProjectAppContext } from 'fireux-fireux/runtime/project/composables/workspace/identity/useProjectAppContext'
const appContext = useProjectAppContext()
import { computed, ref } from 'vue'
import type { ProjectLandingIntent } from 'fireux-core/runtime/project/models/landing-intent'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import type { WorkspaceIntro } from 'fireux-core/runtime/composables/fireux/workspace/workspaceCapabilityContext'
import { projectWorkspaceIntro } from 'fireux-core/runtime/project/utils/project-workspace-intro'
const { state: pageState } = useWorkspacePageState('project')
const surface = ref<{
  performAction: (intent: ProjectLandingIntent) => boolean
} | null>(null)
const canPrepareApp = computed(
  () =>
    pageState.value?.derived?.landingState === 'ready' &&
    pageState.value?.derived?.canUpdate === true &&
    Boolean(pageState.value?.selected)
)
async function performLandingAction(intent: ProjectLandingIntent) {
  if (intent.action === 'open') {
    if (intent.target !== 'app-setup' || !canPrepareApp.value) return false
    await navigateTo('/apps/create')
    return true
  }
  return surface.value?.performAction(intent) ?? false
}
const intro = computed(
  () =>
    (pageState.value?.intro as WorkspaceIntro | undefined) ??
    projectWorkspaceIntro()
)
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
