<template>
  <UDashboardPanel id="console-projects-apps">
    <template #header>
      <LayoutsConsoleNavbar title="Project Apps" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UAlert
          v-if="!selectedProject"
          color="neutral"
          variant="soft"
          title="No project selected"
          description="Select a project on /console/projects before opening project apps."
          :actions="[
            {
              label: 'Go to projects',
              to: '/console/projects',
              icon: 'i-lucide-arrow-right',
            },
          ]"
        />

        <ConsoleProjectApps v-else />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useProjectConsole } from '../../../composables/fireux/project-console/useProjectConsole'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { ecosystems: ['fireux'] },
    key: 'console-projects-apps',
    label: 'Apps',
    icon: 'i-lucide-app-window',
    requiresSelection: true,
    order: 30,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { selectedProject } = useProjectConsole()
</script>
