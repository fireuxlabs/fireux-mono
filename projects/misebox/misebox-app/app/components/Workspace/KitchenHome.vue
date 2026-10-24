<template>
  <UDashboardPanel id="workspace-kitchen-index">
    <template #header>
      <WorkspaceNavbar :title="intro.title"
        ><template #right
          ><WorkspaceIntroInfo
            :intro="intro"
            workspace="kitchen"
            :show-structured-details="false" /></template
      ></WorkspaceNavbar>
      <UDashboardToolbar
        :ui="{ root: 'border-b-0' }"
        v-if="
          workspace.multipleKitchenView.value &&
          workspace.collection.value.length > 1
        "
      >
        <WorkspaceKitchenSelectorChoices
          :collection="workspace.collection.value"
          :selected-id="workspace.id.value"
          @select="workspace.select"
        />
      </UDashboardToolbar>
    </template>
    <template #body>
      <WorkspaceGuestWelcome />
      <WorkspaceKitchenHomeAI :perform-action="performLandingAction" />
      <WorkspaceKitchen ref="workspaceSurface" />
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import WorkspaceGuestWelcome from 'fireux-core/runtime/workspace/components/GuestWelcome.vue'
import WorkspaceIntroInfo from 'fireux-core/runtime/workspace/components/IntroInfo.vue'
import { useWorkspacePageState } from 'fireux-core/runtime/workspace/composables/useWorkspacePageState'
import type { WorkspaceIntro } from 'fireux-core/runtime/workspace/models/capability-context'
import WorkspaceKitchen from 'fireux-kitchens/runtime/kitchen/components/Workspace/Index.vue'
import { useKitchenWorkspace } from 'fireux-kitchens/runtime/kitchen/composables/workspace/useKitchenWorkspace'
import type { KitchenLandingIntent } from 'fireux-kitchens/runtime/kitchen/models/landing-intent'
import { kitchenWorkspaceIntro } from 'fireux-kitchens/runtime/kitchen/utils/kitchen-workspace-intro'

const workspace = useKitchenWorkspace()
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
