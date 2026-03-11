<template>
  <UDashboardPanel id="console-projects-create">
    <template #header>
      <LayoutsConsoleNavbar title="Create Project" />
    </template>

    <template #body>
      <section class="space-y-8">
        <ConsoleOverviewInitializer
          title="Create your first project"
          description="Projects group apps, ecosystems, and project-level operations inside FireUX."
          secondary-label="Learn more"
          secondary-to="/projects/learn-more"
        />

        <UCard>
          <template #header>
            <div class="space-y-1">
              <div class="text-sm font-semibold">Project details</div>
              <div class="text-xs text-dimmed">
                Create a FireUX project and continue into the project console.
              </div>
            </div>
          </template>

          <ProjectCreateForm
            return-to="/console/projects/overview"
            cancel-to="/console/projects/overview"
          />
        </UCard>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import ConsoleOverviewInitializer from 'fireux-core/runtime/components/console/overview/Initializer.vue'
import { useRuntimeProject } from 'fireux-core/runtime/composables/fireux/app/runtime-project/useRuntimeProject'
import ProjectCreateForm from '../../../components/project/Create/Form.vue'

definePageMeta({
  layout: 'console',
  nav: {
    key: 'console-projects-create',
    label: 'Create',
    icon: 'i-lucide-plus',
    order: 15,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeProject()

if (runtime.id.value) {
  await navigateTo('/console/projects/overview', { replace: true })
}
</script>
