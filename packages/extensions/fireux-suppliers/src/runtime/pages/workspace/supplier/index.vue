<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-supplier-home">
      <template #header>
        <LayoutsWorkspaceNavbar title="Supplier Workspace" />
      </template>
      <template #body>
        <WorkspaceHero
          title="Build your Supplier Workspace"
          description="Manage catalogues, ingredients and supply operations."
        />
        <WorkspaceSupplier :state="state" :derived="derived" />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { useSupplierWorkspaceIndex } from '../../../supplier/composables/workspace/index/useSupplierWorkspaceIndex'

const { state, derived } = useSupplierWorkspaceIndex()

definePageMeta({
  layout: 'workspace',
  workspace: 'supplier',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-suppliers'] },
  nav: {
    key: 'workspace-supplier',
    label: 'Supplier',
    icon: 'i-lucide-truck',
    position: 'bottom',
    order: 900,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: false,
})
</script>
