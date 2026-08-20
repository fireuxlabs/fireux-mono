<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-portfolio-compliance">
      <template #header>
        <LayoutsWorkspaceNavbar title="Compliance">
          <template #right>
            <WorkspaceAICapabilityPlaceholder capability="Portfolio Compliance" />
          </template>
        </LayoutsWorkspaceNavbar>
      </template>
      <template #body>
        <UAlert
          title="Compliance"
          description="Portfolio compliance tools are coming next."
          variant="soft"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-properties'] },
  nav: {
    key: 'workspace-portfolio-compliance',
    label: 'Compliance',
    icon: 'i-lucide-shield-check',
    position: 'top',
    order: 21,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
