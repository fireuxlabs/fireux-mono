<template>
  <div>
    <UDashboardPanel id="misebox-kitchen-workspace">
      <template #header>
        <LayoutsWorkspaceNavbar
          title="Kitchen Workspace"
          :show-title="false"
        />
      </template>

      <template #body>
        <div class="workspace-surface grid gap-6">
          <WorkspaceHero
            title="Build your Kitchen Workspace"
            description="Manage Menus, dishes, recipes, preparation and orders."
          />
          <WorkspaceKitchen />
        </div>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: false,
})
</script>
