<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-property-identity">
      <template #header>
        <LayoutsConsoleNavbar title="Property Identity">
          <template #right>
            <ConsoleAICapabilityPlaceholder capability="Property Identity" />
          </template>
        </LayoutsConsoleNavbar>
      </template>

      <template #body>
        <ConsolePropertyIdentity />
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
    key: 'console-property-identity',
    label: 'Identity',
    icon: 'i-lucide-info',
    position: 'top',
    order: 3,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
