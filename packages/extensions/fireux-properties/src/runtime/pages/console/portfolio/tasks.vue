<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-portfolio-tasks">
      <template #header>
        <LayoutsConsoleNavbar title="Tasks">
          <template #right>
            <ConsoleAIOperationPlaceholder operation="Portfolio Tasks" />
          </template>
        </LayoutsConsoleNavbar>
      </template>
      <template #body
        ><UAlert
          title="Tasks"
          description="Portfolio task tools are coming next."
          variant="soft"
      /></template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-properties'] },
  nav: {
    key: 'console-portfolio-tasks',
    label: 'Tasks',
    icon: 'i-lucide-list-checks',
    position: 'top',
    order: 23,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
