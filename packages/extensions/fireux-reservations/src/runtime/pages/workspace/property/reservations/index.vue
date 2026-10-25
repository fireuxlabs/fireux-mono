<template>
  <UButton
    to="/workspace/property/reservations/create"
    icon="i-lucide-plus"
    size="sm"
  >
    Add booking
  </UButton>
  <section class="space-y-5">
    <WorkspacePropertyReservations />
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
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
