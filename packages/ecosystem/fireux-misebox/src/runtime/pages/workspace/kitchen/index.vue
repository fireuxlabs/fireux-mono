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
          <WorkspaceKitchenHero />
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
