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
          <div class="flex flex-wrap items-center gap-3">
            <ProjectCardsPill
              v-if="activeProjectPill"
              v-bind="activeProjectPill"
              :link="false"
              :show-badges="false"
            />
            <UBadge color="neutral" variant="soft" size="lg">
              {{ modeLabel }} Mode
            </UBadge>
          </div>

          <ConsoleProjectOverviewDemo v-if="runtimeMode === 'demo'" />
          <ConsoleProjectOverviewReal v-else-if="runtimeMode === 'live'" />
          <ConsoleProjectOverviewTest v-else />

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Project Areas</div>
            </template>

            <div class="flex flex-wrap gap-2">
              <UButton
                to="/console/projects/apps"
                color="neutral"
                variant="soft"
                icon="i-lucide-app-window"
              >
                Apps
              </UButton>
              <UButton
                to="/console/projects/ecosystem"
                color="neutral"
                variant="soft"
                icon="i-lucide-network"
              >
                Ecosystem
              </UButton>
              <UButton
                to="/console/projects"
                color="neutral"
                variant="ghost"
                icon="i-lucide-refresh-cw"
              >
                Switch project
              </UButton>
            </div>
          </UCard>
        </template>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeProjectConsole } from '~/composables/console/project/useRuntimeProjectConsole'

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

const { runtime, console, activeProjectPill } = useRuntimeProjectConsole({
  publishHeader: true,
})
const runtimeMode = console.mode

const modeLabel = computed(() => {
  if (runtimeMode.value === 'live') return 'Real'
  if (runtimeMode.value === 'test') return 'Test'
  return 'Demo'
})
</script>
