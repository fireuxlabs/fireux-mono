<template>
  <UDashboardPanel id="console-project-home">
    <template #header>
      <LayoutsConsoleNavbar title="Projects">
        <template #right>
          <UButton
            v-if="runtime.id"
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            @click="clearSelection"
          >
            Clear
          </UButton>
        </template>
      </LayoutsConsoleNavbar>
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleProjectReal />

        <DevJson
          title="Project Console Debug"
          context="console/projects"
          :data="{ runtime, consoleState }"
          :default-open="true"
          :hide-when-empty="false"
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useProjectConsole } from '~/composables/console/project/useProjectConsole'

definePageMeta({
  layout: 'console',
  nav: {
    key: 'console-projects',
    label: 'Projects',
    icon: 'i-lucide-briefcase-business',
    order: 900,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const projectConsole = useProjectConsole({
  publishHeader: true,
})
const { runtime, consoleState } = projectConsole
const clearSelection = consoleState.clearSelection
</script>
