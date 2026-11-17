<template>
  <UButton
    to="/workspace/property/reservations/create"
    icon="i-lucide-plus"
    size="sm"
  >
    Add booking
  </UButton>
  <section>
    <WorkspacePropertyReservations />
  </section>
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
    menus: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
