<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-property-reservations">
      <template #header>
        <WorkspaceNavbar title="Reservations">
          <template #right>
            <UButton
              to="/workspace/property/reservations/create"
              icon="i-lucide-plus"
              size="sm"
            >
              Add booking
            </UButton>
          </template>
        </WorkspaceNavbar>
      </template>

      <template #body>
        <section class="space-y-5">
          <WorkspacePropertyReservations />
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
