<template>
  <UDashboardPanel id="console-projects-apps">
    <template #header>
      <LayoutsConsoleNavbar title="Project Apps" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UAlert
          v-if="!runtime.id"
          color="neutral"
          variant="soft"
          title="No project selected"
          description="Select a project on /console/projects before viewing apps."
          :actions="[
            {
              label: 'Go to projects',
              to: '/console/projects',
              icon: 'i-lucide-arrow-right',
            },
          ]"
        />

        <ConsoleProjectAppsLive v-else-if="runtime.mode === 'live'" />
        <ConsoleProjectAppsStatic v-else />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useActiveProject } from '~/composables/console/project/useActiveProject'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { ecosystems: ['fireux'] },
    key: 'console-projects-apps',
    label: 'Apps',
    icon: 'i-lucide-app-window',
    order: 30,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const runtime = useActiveProject()
</script>
