<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-portfolio-compliance">
      <template #header>
        <LayoutsConsoleNavbar title="Compliance">
          <template #right>
            <ConsoleAIOperationPlaceholder operation="Portfolio Compliance" />
          </template>
        </LayoutsConsoleNavbar>
      </template>
      <template #body>
        <UAlert
          title="Compliance"
          description="Portfolio compliance tools are coming next."
          variant="soft"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-properties'] },
  nav: {
    key: 'console-portfolio-compliance',
    label: 'Compliance',
    icon: 'i-lucide-shield-check',
    position: 'top',
    order: 21,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
