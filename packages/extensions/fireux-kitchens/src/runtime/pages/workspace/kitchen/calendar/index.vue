<template>
  <WorkspaceIntroInfo :intro="intro" />
  <UPageHeader
    title="Kitchen Calendar"
    description="A clear view of the days ahead."
  />
  <WorkspaceKitchenSelector />
  <KitchenCalendar />
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
