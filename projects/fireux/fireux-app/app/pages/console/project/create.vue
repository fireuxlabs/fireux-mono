<template>
  <UDashboardPanel id="console-project-create">
    <template #header>
      <LayoutsConsoleNavbar title="Create Project" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ProjectCreateSystem
          mode="console"
          return-to="/console/project"
          cancel-to="/console/project"
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
