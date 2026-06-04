<template>
  <UDashboardPanel id="console-kitchen-identity-place">
    <template #header>
      <LayoutsConsoleNavbar title="Place">
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
        <ConsoleKitchenIdentityPlace />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  requiresAuth: true,
})
</script>
