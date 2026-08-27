<template>
  <section class="workspace-surface">
    <WorkspaceKitchenHero />

    <main class="mx-auto w-full max-w-3xl min-w-0" aria-label="KitchenAI">
      <WorkspaceKitchenAI
        title="What would you like to work on?"
        agent-label=""
        :starters="[]"
        class="kitchen-ai-welcome--landing"
      />
    </main>

    <WorkspaceKitchenActive
      :show-kitchens-action="hasKitchenChoices"
      :kitchens-open="kitchensOpen"
      @toggle-kitchens="kitchensOpen = !kitchensOpen"
    />

    <div id="kitchen-workspace" class="scroll-mt-4">
      <WorkspaceKitchenCollection
        :expanded="!hasKitchenPresentation || kitchensOpen"
        :active-complete="hasKitchenPresentation"
      />
    </div>

    <WorkspaceKitchenOperations />
    <WorkspaceKitchenFreeTools />
    <WorkspaceKitchenDiscovery />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { useKitchenWorkspace } from 'fireux-kitchens/runtime/kitchen/composables/workspace/core/useKitchenWorkspace'
import { useKitchenWorkspaceTools } from 'fireux-kitchens/runtime/kitchen/composables/workspace/index/useKitchenWorkspaceTools'

const kitchen = useKitchenWorkspace()
const { kitchenComplete: hasKitchenPresentation } = useKitchenWorkspaceTools()
const { appAccess } = useUser()
const kitchensOpen = ref(false)
const hasKitchenChoices = computed(
  () =>
    hasKitchenPresentation.value &&
    (kitchen.targets.kitchens.value.length > 1 ||
      appAccess.value.hasBusinessSubscription)
)

watch(
  [hasKitchenPresentation, () => kitchen.selection.kitchenId.value],
  ([complete, activeId], [wasComplete, previousId]) => {
    if ((complete && !wasComplete) || (activeId && activeId !== previousId)) {
      kitchensOpen.value = false
    }
  }
)
</script>
