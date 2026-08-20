<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-portfolio-documents">
      <template #header>
        <LayoutsWorkspaceNavbar title="Documents">
          <template #right>
            <WorkspaceAICapabilityPlaceholder capability="Portfolio Documents" />
          </template>
        </LayoutsWorkspaceNavbar>
      </template>
      <template #body
        ><UAlert
          title="Documents"
          description="Portfolio document tools are coming next."
          variant="soft"
      /></template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-properties'] },
  nav: {
    key: 'workspace-portfolio-documents',
    label: 'Documents',
    icon: 'i-lucide-files',
    position: 'top',
    order: 22,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
