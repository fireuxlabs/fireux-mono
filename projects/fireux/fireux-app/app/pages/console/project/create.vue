<template>
  <UDashboardPanel id="console-project-create">
    <template #header>
      <LayoutsConsoleNavbar title="Create Project" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ProjectCreateSystem
          v-if="canCreate"
          mode="console"
          return-to="/console/project"
          cancel-to="/console/project"
        />

        <UPageCard
          v-else
          title="Project creation is not enabled here"
          description="This app uses existing Project console targets."
          variant="subtle"
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConsole } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import ProjectCreateSystem from 'fireux-core/runtime/components/Project/Create/System.vue'

const { canCreateTarget } = useConsole('project')
const canCreate = computed(() => canCreateTarget())

definePageMeta({
  layout: 'console',
  nav: {
    key: 'console-project-create',
    label: 'Create',
    icon: 'i-lucide-plus',
    position: 'bottom',
    requiresSelection: false,
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
