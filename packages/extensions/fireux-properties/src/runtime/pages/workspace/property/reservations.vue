<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-property-reservations">
      <template #header>
        <LayoutsWorkspaceNavbar title="Reservations">
          <template #right>
            <WorkspaceAICapabilityPlaceholder capability="Property Reservations" />
          </template>
        </LayoutsWorkspaceNavbar>
      </template>
      <template #body
        ><UAlert
          title="Reservations"
          description="Property reservation tools are coming next."
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
    key: 'workspace-property-reservations',
    label: 'Reservations',
    icon: 'i-lucide-calendar-days',
    position: 'top',
    order: 4,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
