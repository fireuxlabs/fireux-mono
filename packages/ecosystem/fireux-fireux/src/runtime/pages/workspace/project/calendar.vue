<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-project-calendar">
      <template #header>
        <WorkspaceNavbar title="Project Calendar"
          ><template #right><WorkspaceIntroInfo :intro="intro" /></template
        ></WorkspaceNavbar>
      </template>

      <template #body>
        <WorkspaceFreemium
          family="project"
          capability="calendar"
          page-label="Calendar"
          placement="top"
        />
        <WorkspaceProjectCalendar />
        <WorkspaceFreemium
          family="project"
          capability="calendar"
          page-label="Calendar"
          placement="bottom"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import WorkspaceIntroInfo from 'fireux-core/runtime/workspace/components/IntroInfo.vue'
const intro = {
  title: 'Project Calendar',
  purpose: 'Browse dates in a visual month view.',
  data: 'The selected date and displayed month. No event collection is connected yet.',
  boundaries: 'Selecting a date does not create or change events.',
  ai: 'No AI actions are connected to this surface.',
}
import WorkspaceFreemium from 'fireux-core/runtime/workspace/components/Freemium.vue'
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-project-calendar',
    label: 'Calendar',
    icon: 'i-lucide-calendar-range',
    position: 'top',
    order: 2,
    desktop: false,
    mobile: false,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
