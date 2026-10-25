<template>
  <WorkspaceIntroInfo :intro="intro" />
  <UPageHeader
    title="Kitchen Calendar"
    description="A clear view of the days ahead."
  />
  <WorkspaceKitchenSelector />
  <WorkspaceFreemium
    family="kitchen"
    capability="calendar"
    page-label="Calendar"
    placement="top"
  />
  <KitchenCalendar />
  <WorkspaceFreemium
    family="kitchen"
    capability="calendar"
    page-label="Calendar"
    placement="bottom"
  />
</template>

<script setup lang="ts">
import WorkspaceIntroInfo from 'fireux-core/runtime/workspace/components/IntroInfo.vue'
const intro = {
  title: 'Kitchen Calendar',
  purpose: 'Browse dates in a visual month view.',
  data: 'The selected date and displayed month. No event collection is connected yet.',
  boundaries: 'Selecting a date does not create or change events.',
  ai: 'No AI actions are connected to this surface.',
}
import WorkspaceFreemium from 'fireux-core/runtime/workspace/components/Freemium.vue'
import KitchenCalendar from '../../../../kitchen/components/Calendar/Index.vue'
definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  workspaceAccess: 'authenticated',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-calendar',
    label: 'Calendar',
    group: '',
    icon: 'i-lucide-calendar-range',
    position: 'middle',
    order: 50,
    desktop: false,
    mobile: false,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
