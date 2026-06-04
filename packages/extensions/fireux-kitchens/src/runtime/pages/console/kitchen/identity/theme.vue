<template>
  <UDashboardPanel id="console-kitchen-identity-theme">
    <template #header>
      <LayoutsConsoleNavbar title="Theme">
        <template #right>
          <UButton
            size="sm"
            color="neutral"
            variant="ghost"
            icon="i-lucide-arrow-left"
            to="/console/kitchen/identity"
          >
            Identity
          </UButton>
        </template>
      </LayoutsConsoleNavbar>
    </template>

    <template #body>
      <div class="console-profile">
        <ConsoleKitchenIdentityTheme />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-identity-theme',
    label: 'Theme',
    icon: 'i-lucide-palette',
    position: 'top',
    requiresSelection: true,
    order: 4,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
