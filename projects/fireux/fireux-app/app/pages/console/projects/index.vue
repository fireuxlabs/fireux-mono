<template>
  <UDashboardPanel id="console-project-home">
    <template #header>
      <LayoutsConsoleNavbar title="Project Overview" />
    </template>

    <template #body>
      <section class="space-y-4">
        <UAlert
          v-if="activeProjectPill"
          color="primary"
          variant="soft"
          :title="activeProjectPill.title"
          :description="activeProjectPill.subtitle || ''"
        />

        <UAlert
          v-else-if="showSelector"
          color="neutral"
          variant="soft"
          title="Select a demo project"
        />

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          title="No demo projects"
        />

        <div v-if="showSelector" class="space-y-2">
          <ProjectCardsPill
            v-for="item in scenarioPills"
            :key="item.id"
            v-bind="item"
            :link="false"
            :action="true"
            :show-badges="false"
            class="cursor-pointer"
            @action="selectScenario(item.id)"
          />
        </div>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'
import { useRuntimeProjectConsole } from '~/composables/console/project/useRuntimeProjectConsole'

definePageMeta({
  layout: 'console',
  requiresAuth: true,
})

const {
  runtime,
  scenarios,
  scenarioPills,
  activeProjectPill,
  showSelector,
  setActiveScenario,
} = useRuntimeProjectConsole()

if (import.meta.client) {
  watchEffect(() => {
    if (runtime.id.value) return
    if (scenarios.value.length !== 1) return
    setActiveScenario(String(scenarios.value[0]?.id || ''))
  })
}

const selectScenario = (projectId: string) => {
  setActiveScenario(projectId)
}
</script>
