<template>
  <UDashboardPanel id="workspace-kitchen-index">
    <template #header>
      <LayoutsWorkspaceNavbar :title="intro.title"
        ><template #right
          ><WorkspaceIntroInfo
            :intro="intro"
            workspace="kitchen"
            :show-structured-details="false" /></template
      ></LayoutsWorkspaceNavbar>
    </template>
    <template #body>
      <WorkspaceHero
        compact
        :title="intro.title"
        :description="intro.purpose"
      />
      <WorkspaceGuestWelcome />
      <WorkspaceKitchenHomeAI :perform-action="performLandingAction" />
      <WorkspaceKitchen ref="workspaceSurface" />
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import WorkspaceGuestWelcome from 'fireux-core/runtime/components/Workspace/GuestWelcome.vue'
import WorkspaceIntroInfo from 'fireux-core/runtime/components/Workspace/IntroInfo.vue'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import type { WorkspaceIntro } from 'fireux-core/runtime/composables/fireux/workspace/workspaceCapabilityContext'
import WorkspaceKitchen from 'fireux-kitchens/runtime/kitchen/components/Workspace/Index.vue'
import type { KitchenLandingIntent } from 'fireux-kitchens/runtime/kitchen/models/landing-intent'
import { kitchenWorkspaceIntro } from 'fireux-kitchens/runtime/kitchen/utils/kitchen-workspace-intro'

const workspaceSurface = ref<InstanceType<typeof WorkspaceKitchen> | null>(null)
const { state: pageState } = useWorkspacePageState('kitchen')
const intro = computed(
  () =>
    (pageState.value?.intro as WorkspaceIntro | undefined) ??
    kitchenWorkspaceIntro()
)
const performLandingAction = (intent: KitchenLandingIntent) =>
  workspaceSurface.value?.performAction(intent) ?? false
</script>
