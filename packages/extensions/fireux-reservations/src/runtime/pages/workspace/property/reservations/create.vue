<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-property-reservations-create">
      <template #header>
        <WorkspaceNavbar title="Add booking">
          <template #right>
            <UButton
              to="/workspace/property/reservations"
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="sm"
            >
              Close
            </UButton>
          </template>
        </WorkspaceNavbar>
      </template>

      <template #body>
        <section class="panels-narrow space-y-5">
          <WorkspacePropertyReservationsCreate />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'create',
  visibility: { modules: ['fireux-reservations'] },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
