<template>
  <WorkspaceIntroInfo
    :intro="intro"
    workspace="project"
    :show-structured-details="false"
  />
  <ClientOnly>
    <UDashboardToolbar v-if="isSignedIn"
      ><WorkspaceProjectSelector /> </UDashboardToolbar
  ></ClientOnly>
  <WorkspacePageHeader :title="intro.title" :description="intro.purpose" />
  <ClientOnly>
    <WorkspaceGuestWelcome />
    <WorkspaceProjectHomeAI
      :perform-action="performLandingAction"
      :can-prepare-app="canPrepareApp"
    />
    <WorkspaceProject ref="surface" />
    <WorkspaceProjectHomeExploreProjects />
    <template #fallback>
      <p role="status" class="fx-type-body">Loading your Workspace…</p>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useAuthPhase } from 'fireux-core/runtime/composables/fireux/firebase/useAuthPhase'
import WorkspaceGuestWelcome from 'fireux-core/runtime/workspace/components/GuestWelcome.vue'
import WorkspaceIntroInfo from 'fireux-core/runtime/workspace/components/IntroInfo.vue'
import { navigateTo } from '#imports'
import { computed, ref } from 'vue'
import type { ProjectLandingIntent } from 'fireux-projects/runtime/project/models/landing-intent'
import { useWorkspacePageState } from 'fireux-core/runtime/workspace/composables/useWorkspacePageState'
import type { WorkspaceIntro } from 'fireux-core/runtime/workspace/models/capability-context'
import { projectWorkspaceIntro } from 'fireux-projects/runtime/project/utils/project-workspace-intro'

const { isSignedIn } = useAuthPhase()
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
    await navigateTo('/workspace/project/apps')
    return true
  }
  return surface.value?.performAction(intent) ?? false
}
const intro = computed(
  () =>
    (pageState.value?.intro as WorkspaceIntro | undefined) ??
    projectWorkspaceIntro()
)
</script>
