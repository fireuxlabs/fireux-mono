<template>
  <UButton
    to="/workspace/property/reservations/create"
    icon="i-lucide-calendar-plus-2"
    size="sm"
  >
    Add booking
  </UButton>
  <section class="space-y-5">
    <WorkspaceHero
      compact
      title="Property Calendar"
      description="View reservations and property availability."
    />
    <WorkspacePropertySelector />
    <WorkspaceAI compact aria-label="Property Calendar AI"
      ><UAlert title="Calendar AI is not connected yet" color="neutral" />
    </WorkspaceAI>
    <WorkspacePropertyCalendar />
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-reservations'] },
  nav: {
    key: 'workspace-property-calendar',
    label: 'Calendar',
    icon: 'i-lucide-calendar-range',
    position: 'top',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
