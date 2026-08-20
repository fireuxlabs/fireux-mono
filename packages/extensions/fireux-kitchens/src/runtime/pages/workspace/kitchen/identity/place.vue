<!-- Concurrent edit — 2026-07-20 16:26 CEST — Extension Workspace Spine pass: require an active Kitchen for the Place identity route. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-identity-place">
      <template #header>
        <LayoutsWorkspaceNavbar title="Place">
          <template #right>
            <UButton
              size="sm"
              color="neutral"
              variant="ghost"
              icon="i-lucide-arrow-left"
              to="/workspace/kitchen/identity"
            >
              Identity
            </UButton>
          </template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <div class="workspace-profile">
          <WorkspaceKitchenIdentityPlace />
        </div>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  requiresAuth: true,
  requiresSelection: true,
})
</script>
