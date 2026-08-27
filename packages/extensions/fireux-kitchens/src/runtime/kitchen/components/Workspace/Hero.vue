<template>
  <WorkspaceHero
    title="Create and manage your Kitchen profile"
    :description="introduction"
  >
    <template #links>
      <USkeleton
        v-if="workspacePending"
        class="h-10 w-32 rounded-md"
        aria-label="Loading Kitchen action"
      />
      <UButton
        v-else-if="kitchenTool?.kind === 'create'"
        label="Start a Kitchen"
        color="primary"
        type="button"
        @click="performAction(kitchenTool.id)"
      />
      <slot name="links">
        <UButton
          to="/tools"
          label="Browse restaurant tools"
          color="neutral"
          variant="soft"
          trailing-icon="i-lucide-arrow-right"
        />
      </slot>
    </template>
  </WorkspaceHero>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { useKitchenWorkspace } from '../../composables/workspace/core/useKitchenWorkspace'
import { useKitchenWorkspaceTools } from '../../composables/workspace/index/useKitchenWorkspaceTools'

const { appAccess } = useUser()
const workspace = useKitchenWorkspace()
const {
  workspacePending,
  kitchenComplete: complete,
  kitchenTool,
  activeName,
  performAction,
} = useKitchenWorkspaceTools(workspace)
const introduction = computed(() => {
  if (workspacePending.value) {
    return 'Add a name, tagline and image to create your Kitchen profile.'
  }
  if (!complete.value) {
    return activeName.value
      ? `Add the missing name, tagline or image to complete ${activeName.value}.`
      : 'Add a name, tagline and image to create your Kitchen profile.'
  }
  if (appAccess.value.subscription === 'business') {
    return 'Manage multiple Kitchens, their profiles, Menus and teams.'
  }
  if (appAccess.value.subscription === 'premium') {
    return `Manage ${activeName.value || 'your Kitchen'} and publish multiple Menus.`
  }
  return `Manage ${activeName.value || 'your Kitchen'} and publish a restaurant Menu.`
})
</script>
