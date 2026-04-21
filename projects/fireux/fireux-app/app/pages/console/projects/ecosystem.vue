<template>
  <UDashboardPanel id="console-projects-ecosystem">
    <template #header>
      <LayoutsConsoleNavbar title="Project Ecosystem" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UAlert
          v-if="!selectedProject"
          color="neutral"
          variant="soft"
          title="No project selected"
          description="Select a project on /console/projects before opening project ecosystem."
          :actions="[
            {
              label: 'Go to projects',
              to: '/console/projects',
              icon: 'i-lucide-arrow-right',
            },
          ]"
        />

        <ConsoleProjectEcosystem v-else />
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
    key: 'console-projects-ecosystem',
    label: 'Ecosystem',
    icon: 'i-lucide-orbit',
    requiresSelection: true,
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { selectedProject } = useProjectConsole()
</script>
