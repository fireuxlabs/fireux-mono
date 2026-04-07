<template>
  <UDashboardPanel id="console-projects-overview">
    <template #header>
      <LayoutsConsoleNavbar title="Project Overview" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UAlert
          v-if="!runtime.id"
          color="neutral"
          variant="soft"
          title="No project selected"
          description="Select a project on /console/projects before opening the project overview."
          :actions="[
            {
              label: 'Go to projects',
              to: '/console/projects',
              icon: 'i-lucide-arrow-right',
            },
          ]"
        />

        <template v-else>
          <ProjectCardsPill
            v-if="activeProjectPill"
            v-bind="activeProjectPill"
            :link="false"
            :show-badges="false"
          />

          <ConsoleProjectOverviewReal />
        </template>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useProjectConsole } from '~/composables/console/project/useProjectConsole'

definePageMeta({
  layout: 'console',
  nav: {
    key: 'console-projects-overview',
    label: 'Overview',
    icon: 'i-lucide-house',
    order: 0,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { runtime, activeProjectPill } = useProjectConsole({
  publishHeader: true,
})
</script>
