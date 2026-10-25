<template>
  <WorkspaceHero
    compact
    title="Property Test"
    description="Save and manage simple strings."
  />
  <WorkspacePropertySelector />
  <WorkspaceAI compact aria-label="Property Test AI"
    ><UAlert
      title="Test AI is not connected yet"
      color="neutral"
    /> </WorkspaceAI
  ><WorkspacePropertyTest />
</template>
<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
  pageTransition: false,
  workspace: 'property',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-properties'] },
  nav: {
    key: 'workspace-property-test',
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
