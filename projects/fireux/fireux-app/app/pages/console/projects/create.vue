<template>
  <UDashboardPanel id="console-project-create">
    <template #header>
      <LayoutsConsoleNavbar title="Create Project" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ProjectCreateSystem
          mode="console"
          return-to="/console/projects"
          cancel-to="/console/projects"
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import ProjectCreateSystem from 'fireux-core/runtime/components/organisms/Project/Create/System.vue'

definePageMeta({
  layout: 'console',
  nav: {
    key: 'console-projects-create',
    label: 'Create',
    icon: 'i-lucide-plus',
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
