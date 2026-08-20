<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-property-reservations">
      <template #header>
        <LayoutsWorkspaceNavbar title="Reservations">
          <template #right>
            <UButton
              to="/workspace/property/reservations/create"
              icon="i-lucide-plus"
              size="sm"
            >
              Add booking
            </UButton>
          </template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="space-y-5">
          <WorkspacePropertyOperationsReservations />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-reservations'] },
  nav: {
    key: 'workspace-property-reservations',
    label: 'Reservations',
    icon: 'i-lucide-book-open-check',
    position: 'top',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
