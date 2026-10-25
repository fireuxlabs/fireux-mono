<template>
  <UPageHeader
    title="Supplier Test"
    description="Save and manage simple strings."
  />
  <WorkspaceSupplierSelector />
  <WorkspaceAI compact aria-label="Supplier Test AI"
    ><UAlert
      title="Test AI is not connected yet"
      color="neutral"
    /> </WorkspaceAI
  ><WorkspaceSupplierTest />
</template>
<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
  pageTransition: false,
  workspace: 'supplier',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-suppliers'] },
  nav: {
    key: 'workspace-supplier-test',
    label: 'Test',
    group: 'Workspace',
    icon: 'i-lucide-flask-conical',
    position: 'top',
    order: 7,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
