<template>
  <section class="workspace-surface">
    <div v-if="kitchenId" class="space-y-4">
      <header class="space-y-1">
        <h1 class="text-xl font-semibold text-highlighted">Menus</h1>
        <p class="text-sm text-muted">
          Open a menu to manage its content, ordering and publishing.
        </p>
      </header>

      <WorkspaceKitchenMenusRoles />

      <WorkspaceKitchenMenusList />

      <WorkspaceKitchenMenusDebug />
    </div>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="Select a kitchen"
      description="Choose a kitchen before managing menus."
    />
  </section>
</template>

<script setup lang="ts">
import { useKitchenMenusWorkspace } from '../../../composables/workspace/Menus/useKitchenMenusWorkspace'

const { kitchenId } = useKitchenMenusWorkspace()
</script>
