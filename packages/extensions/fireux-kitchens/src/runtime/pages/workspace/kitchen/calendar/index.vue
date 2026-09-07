<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-calendar">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Calendar"
          ><template #right><WorkspaceIntroInfo :intro="intro" /></template
        ></LayoutsWorkspaceNavbar>
      </template>

      <template #body>
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
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import WorkspaceIntroInfo from 'fireux-core/runtime/components/Workspace/IntroInfo.vue'
const intro = {
  title: 'Kitchen Calendar',
  purpose: 'Browse dates in a visual month view.',
  data: 'The selected date and displayed month. No event collection is connected yet.',
  boundaries: 'Selecting a date does not create or change events.',
  ai: 'No AI actions are connected to this surface.',
}
import WorkspaceFreemium from 'fireux-core/runtime/components/Workspace/Freemium.vue'
import KitchenCalendar from '../../../../kitchen/components/Workspace/Calendar/Index.vue'
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'authenticated',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-calendar',
    label: 'Calendar',
    group: 'Workspace',
    icon: 'i-lucide-calendar-range',
    position: 'top',
    order: 1,
    desktop: false,
    mobile: false,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
