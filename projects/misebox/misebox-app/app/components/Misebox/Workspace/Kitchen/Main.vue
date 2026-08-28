<template>
  <section class="workspace-surface">
    <pre v-if="isDev" class="overflow-x-auto text-xs text-muted">{{
      state
    }}</pre>

    <WorkspaceKitchenHero />
    <WorkspaceKitchenAI />
    <WorkspaceKitchen />
    <WorkspaceKitchenOperations />
    <MiseboxWorkspaceKitchenTools />
    <MiseboxWorkspaceKitchenDiscovery />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { useKitchenWorkspace } from 'fireux-kitchens/runtime/kitchen/composables/workspace/core/useKitchenWorkspace'
import { useKitchenWorkspaceTools } from 'fireux-kitchens/runtime/kitchen/composables/workspace/index/useKitchenWorkspaceTools'

const isDev = import.meta.dev
const { currentUser: authUser } = useAuth()
const { appAccess } = useUser()
const workspace = useKitchenWorkspace()
const {
  activeName,
  activeDescription,
  activeImage,
  kitchenComplete,
  canCreateKitchen,
} = useKitchenWorkspaceTools(workspace)

const state = computed(() => ({
  signedIn: Boolean(authUser.value && !authUser.value.isAnonymous),
  subscription: appAccess.value.subscription,
  activeKitchen: workspace.selection.kitchenId.value
    ? {
        id: workspace.selection.kitchenId.value,
        name: activeName.value,
        hasTagline: Boolean(activeDescription.value),
        hasImage: Boolean(activeImage.value),
      }
    : null,
  kitchenCount: workspace.targets.kitchens.value.length,
  kitchenComplete: kitchenComplete.value,
  canCreateKitchen: canCreateKitchen.value,
}))
</script>
