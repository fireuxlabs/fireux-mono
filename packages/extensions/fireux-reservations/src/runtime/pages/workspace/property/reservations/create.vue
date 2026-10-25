<template>
  <UButton
    to="/workspace/property/reservations"
    icon="i-lucide-x"
    color="neutral"
    variant="ghost"
    size="sm"
  >
    Close
  </UButton>
  <section class="panels-narrow space-y-5">
    <WorkspacePropertyReservationsCreate />
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'create',
  visibility: { modules: ['fireux-reservations'] },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
