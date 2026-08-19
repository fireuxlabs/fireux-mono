<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-portfolio-documents">
      <template #header>
        <LayoutsConsoleNavbar title="Documents">
          <template #right>
            <ConsoleAICapabilityPlaceholder capability="Portfolio Documents" />
          </template>
        </LayoutsConsoleNavbar>
      </template>
      <template #body
        ><UAlert
          title="Documents"
          description="Portfolio document tools are coming next."
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
    key: 'console-portfolio-documents',
    label: 'Documents',
    icon: 'i-lucide-files',
    position: 'top',
    order: 22,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
