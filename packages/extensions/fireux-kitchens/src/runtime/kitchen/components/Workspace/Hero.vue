<template>
  <WorkspaceHero
    title="Build and manage your Kitchen"
    description="Create your Kitchen workspace, publish Menus, and connect dishes, recipes, preparation and orders."
  >
    <template #links>
      <UButton
        v-if="!hasActiveKitchen && canCreateKitchen"
        label="Start a Kitchen"
        color="primary"
        type="button"
        @click="performAction('create-kitchen')"
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
import { useKitchenWorkspace } from '../../composables/workspace/core/useKitchenWorkspace'
import { useKitchenWorkspaceTools } from '../../composables/workspace/index/useKitchenWorkspaceTools'

const workspace = useKitchenWorkspace()
const { hasActiveKitchen, canCreateKitchen, performAction } =
  useKitchenWorkspaceTools(workspace)
</script>
